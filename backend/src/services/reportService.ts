import prisma from '../config/database';
import { ChallanStatus, MovementType, CustomerStatus, CustomerType } from '@prisma/client';

export const getChallanReport = async (filters: { dateFrom?: string; dateTo?: string; status?: string; customerId?: string; createdById?: string }) => {
  const where: any = {};
  
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }
  
  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status as ChallanStatus;
  }
  
  if (filters.customerId && filters.customerId !== 'ALL') {
    where.customerId = filters.customerId;
  }
  
  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  const challans = await prisma.challan.findMany({
    where,
    include: {
      customer: { select: { businessName: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalChallans = challans.length;
  let confirmedCount = 0;
  let draftCount = 0;
  let cancelledCount = 0;
  let totalQuantity = 0;

  challans.forEach(c => {
    if (c.status === 'CONFIRMED') confirmedCount++;
    if (c.status === 'DRAFT') draftCount++;
    if (c.status === 'CANCELLED') cancelledCount++;
    totalQuantity += c.totalQuantity;
  });

  return {
    summary: {
      totalChallans,
      confirmedCount,
      draftCount,
      cancelledCount,
      totalQuantity
    },
    data: challans
  };
};

export const getInventoryReport = async (filters: { category?: string; stockStatus?: string; warehouse?: string }) => {
  const where: any = {};

  if (filters.category && filters.category !== 'ALL') {
    where.category = filters.category;
  }
  if (filters.warehouse && filters.warehouse !== 'ALL') {
    where.warehouseLocation = filters.warehouse;
  }

  let products = await prisma.product.findMany({
    where,
    orderBy: { productName: 'asc' }
  });

  if (filters.stockStatus && filters.stockStatus !== 'ALL') {
    if (filters.stockStatus === 'IN_STOCK') {
      products = products.filter(p => p.currentStock > p.minimumStock);
    } else if (filters.stockStatus === 'LOW_STOCK') {
      products = products.filter(p => p.currentStock <= p.minimumStock && p.currentStock > 0);
    } else if (filters.stockStatus === 'OUT_OF_STOCK') {
      products = products.filter(p => p.currentStock === 0);
    }
  }

  const totalProducts = products.length;
  let totalStockUnits = 0;
  let lowStockProducts = 0;
  let outOfStockProducts = 0;

  products.forEach(p => {
    totalStockUnits += p.currentStock;
    if (p.currentStock === 0) outOfStockProducts++;
    else if (p.currentStock <= p.minimumStock) lowStockProducts++;
  });

  return {
    summary: {
      totalProducts,
      totalStockUnits,
      lowStockProducts,
      outOfStockProducts
    },
    data: products
  };
};

export const getStockMovementReport = async (filters: { productId?: string; movementType?: string; dateFrom?: string; dateTo?: string }) => {
  const where: any = {};
  
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }

  if (filters.productId && filters.productId !== 'ALL') {
    where.productId = filters.productId;
  }

  if (filters.movementType && filters.movementType !== 'ALL') {
    where.movementType = filters.movementType as MovementType;
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: { select: { productName: true, sku: true } },
      createdBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalMovements = movements.length;
  let totalInQuantity = 0;
  let totalOutQuantity = 0;

  movements.forEach(m => {
    if (m.movementType === 'IN') totalInQuantity += m.quantity;
    if (m.movementType === 'OUT') totalOutQuantity += m.quantity;
  });

  return {
    summary: {
      totalInQuantity,
      totalOutQuantity,
      totalMovements
    },
    data: movements
  };
};

export const getCustomerReport = async (filters: { search?: string; status?: string; customerType?: string }) => {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { businessName: { contains: filters.search, mode: 'insensitive' } },
      { customerName: { contains: filters.search, mode: 'insensitive' } },
      { mobile: { contains: filters.search } }
    ];
  }

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status as CustomerStatus;
  }

  if (filters.customerType && filters.customerType !== 'ALL') {
    where.customerType = filters.customerType as CustomerType;
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { businessName: 'asc' }
  });

  const totalCustomers = customers.length;
  let activeCustomers = 0;
  let leadCustomers = 0;
  let inactiveCustomers = 0;
  let retailCount = 0;
  let wholesaleCount = 0;
  let distributorCount = 0;

  customers.forEach(c => {
    if (c.status === 'ACTIVE') activeCustomers++;
    if (c.status === 'LEAD') leadCustomers++;
    if (c.status === 'INACTIVE') inactiveCustomers++;

    if (c.customerType === 'RETAIL') retailCount++;
    if (c.customerType === 'WHOLESALE') wholesaleCount++;
    if (c.customerType === 'DISTRIBUTOR') distributorCount++;
  });

  return {
    summary: {
      totalCustomers,
      activeCustomers,
      leadCustomers,
      inactiveCustomers,
      retailCount,
      wholesaleCount,
      distributorCount
    },
    data: customers
  };
};
