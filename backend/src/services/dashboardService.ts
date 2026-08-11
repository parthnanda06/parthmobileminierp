import prisma from '../config/database';
import { Role, ChallanStatus, MovementType } from '@prisma/client';

export const getDashboardMetrics = async (userId: string, role: Role) => {
  const metrics: any = {};

  if (role === Role.ADMIN) {
    const [customers, products, stockUnitsRaw, lowStock, challanTotal, challanConfirmed, challanDraft] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { currentStock: true } }),
      prisma.product.count({ where: { currentStock: { lte: prisma.product.fields.minimumStock } } }), // using field comparison doesn't work directly in Prisma count where, we have to fetch or write a raw query.
      // Correction: Prisma can't do column comparison easily in count. I will use a simple findMany for lowStock.
      prisma.challan.count(),
      prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
    ]);

    // Prisma limitation workaround:
    const allProducts = await prisma.product.findMany({ select: { currentStock: true, minimumStock: true }});
    const lowStockCount = allProducts.filter(p => p.currentStock <= p.minimumStock).length;

    metrics.totalCustomers = customers;
    metrics.totalProducts = products;
    metrics.totalStockUnits = stockUnitsRaw._sum.currentStock || 0;
    metrics.lowStockProducts = lowStockCount;
    metrics.totalChallans = challanTotal;
    metrics.confirmedChallans = challanConfirmed;
    metrics.draftChallans = challanDraft;

  } else if (role === Role.SALES) {
    const [myChallans, myDrafts, myConfirmed, followUps] = await Promise.all([
      prisma.challan.count({ where: { createdById: userId } }),
      prisma.challan.count({ where: { createdById: userId, status: ChallanStatus.DRAFT } }),
      prisma.challan.count({ where: { createdById: userId, status: ChallanStatus.CONFIRMED } }),
      prisma.customerFollowUp.count({ where: { createdById: userId } }),
    ]);

    metrics.myChallans = myChallans;
    metrics.myDraftChallans = myDrafts;
    metrics.myConfirmedChallans = myConfirmed;
    metrics.customerFollowUps = followUps;

  } else if (role === Role.WAREHOUSE) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [products, stockUnitsRaw, stockInTodayRaw, stockOutTodayRaw] = await Promise.all([
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { currentStock: true } }),
      prisma.stockMovement.aggregate({
        _sum: { quantity: true },
        where: { movementType: MovementType.IN, createdAt: { gte: today } }
      }),
      prisma.stockMovement.aggregate({
        _sum: { quantity: true },
        where: { movementType: MovementType.OUT, createdAt: { gte: today } }
      }),
    ]);

    const allProducts = await prisma.product.findMany({ select: { currentStock: true, minimumStock: true }});
    const lowStockCount = allProducts.filter(p => p.currentStock <= p.minimumStock).length;

    metrics.totalProducts = products;
    metrics.totalStockUnits = stockUnitsRaw._sum.currentStock || 0;
    metrics.lowStockProducts = lowStockCount;
    metrics.stockInToday = stockInTodayRaw._sum.quantity || 0;
    metrics.stockOutToday = stockOutTodayRaw._sum.quantity || 0;

  } else if (role === Role.ACCOUNTS) {
    const [challanTotal, challanConfirmed, challanDraft, challanCancelled] = await Promise.all([
      prisma.challan.count(),
      prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.challan.count({ where: { status: ChallanStatus.CANCELLED } }),
    ]);

    metrics.totalChallans = challanTotal;
    metrics.confirmedChallans = challanConfirmed;
    metrics.draftChallans = challanDraft;
    metrics.cancelledChallans = challanCancelled;
  }

  return {
    role,
    metrics
  };
};
