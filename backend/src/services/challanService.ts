import prisma from '../config/database';
import { Prisma, ChallanStatus, MovementType } from '@prisma/client';

const generateChallanNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  // Simple way to avoid collision in basic concurrency: use count or max id.
  // We'll use a transaction with count lock if needed, but for this milestone we can use count + 1 and retry if it fails (unique constraint), or simply rely on total count.
  const count = await prisma.challan.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `SC-${currentYear}-${nextNum}`;
};

const checkDuplicateProducts = (items: { productId: string }[]) => {
  const productIds = items.map(item => item.productId);
  if (new Set(productIds).size !== productIds.length) {
    throw new Error('DUPLICATE_PRODUCTS');
  }
};

export const getChallans = async ({
  page = 1,
  limit = 10,
  search,
  status,
  customerId,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.ChallanWhereInput = {};

  if (search) {
    where.OR = [
      { challanNumber: { contains: search, mode: 'insensitive' } },
      { customer: { businessName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status as ChallanStatus;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { businessName: true, mobile: true } },
        createdBy: { select: { name: true, role: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.challan.count({ where }),
  ]);

  return {
    challans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getChallanById = async (id: string) => {
  return prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      createdBy: { select: { name: true, role: true } },
    },
  });
};

export const createDraft = async (data: { customerId: string, items: { productId: string, quantity: number }[] }, createdById: string) => {
  checkDuplicateProducts(data.items);
  
  return prisma.$transaction(async (tx) => {
    // Verify customer
    const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    // Fetch product snapshots
    const productIds = data.items.map(i => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    
    if (products.length !== productIds.length) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const challanNumber = await generateChallanNumber();
    
    let totalQuantity = 0;
    const challanItemsData = data.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      totalQuantity += item.quantity;
      return {
        productId: product.id,
        productName: product.productName,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
      };
    });

    // We can rely on a try-catch for unique constraint if challan number exists, but we assume it works sequentially.
    return tx.challan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        createdById,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        items: true,
      }
    });
  });
};

export const updateDraft = async (id: string, data: { customerId: string, items: { productId: string, quantity: number }[] }) => {
  checkDuplicateProducts(data.items);

  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id } });
    if (!challan) throw new Error('CHALLAN_NOT_FOUND');
    if (challan.status !== ChallanStatus.DRAFT) throw new Error('NOT_DRAFT');

    const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    const productIds = data.items.map(i => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) throw new Error('PRODUCT_NOT_FOUND');

    // Delete old items
    await tx.challanItem.deleteMany({ where: { challanId: id } });

    let totalQuantity = 0;
    const challanItemsData = data.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      totalQuantity += item.quantity;
      return {
        productId: product.id,
        productName: product.productName,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
      };
    });

    return tx.challan.update({
      where: { id },
      data: {
        customerId: data.customerId,
        totalQuantity,
        items: {
          create: challanItemsData,
        }
      },
      include: {
        items: true,
      }
    });
  });
};

export const confirmChallan = async (id: string, confirmedById: string) => {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ 
      where: { id },
      include: { items: true }
    });

    if (!challan) throw new Error('CHALLAN_NOT_FOUND');
    if (challan.status !== ChallanStatus.DRAFT) throw new Error('ALREADY_CONFIRMED');

    // Step 2 & 13: Check current stock
    const productIds = challan.items.map(i => i.productId);
    
    // Lock the rows using raw query if needed, but simple findMany inside tx is usually fine for basic isolation in Prisma (depending on isolation level).
    const products = await tx.product.findMany({
      where: { id: { in: productIds } }
    });

    const insufficientStockErrors: any[] = [];

    challan.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.currentStock < item.quantity) {
        insufficientStockErrors.push({
          productId: item.productId,
          productName: item.productName,
          available: product ? product.currentStock : 0,
          requested: item.quantity,
        });
      }
    });

    if (insufficientStockErrors.length > 0) {
      const error: any = new Error('INSUFFICIENT_STOCK');
      error.details = insufficientStockErrors;
      throw error;
    }

    // Sufficient stock, do updates
    for (const item of challan.items) {
      // 1. Decrement stock
      await tx.product.update({
        where: { id: item.productId },
        data: {
          currentStock: { decrement: item.quantity }
        }
      });

      // 2. Create StockMovement OUT
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: MovementType.OUT,
          reason: `Sales Challan ${challan.challanNumber}`,
          createdById: confirmedById,
        }
      });
    }

    // 3. Set CONFIRMED
    return tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CONFIRMED },
    });
  });
};

export const cancelChallan = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id } });
    if (!challan) throw new Error('CHALLAN_NOT_FOUND');
    if (challan.status === ChallanStatus.CONFIRMED) {
      throw new Error('CANNOT_CANCEL_CONFIRMED');
    }

    return tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
    });
  });
};
