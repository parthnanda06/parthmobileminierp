import prisma from '../config/database';
import { Prisma, ChallanStatus, MovementType } from '@prisma/client';
import PDFDocument from 'pdfkit';

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

export const generateChallanPdf = (challan: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      
      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('PARTH MOBILE DISTRIBUTION', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').text('SALES CHALLAN', { align: 'center' });
      doc.moveDown(2);

      // Metadata & Customer Info Layout
      const topY = doc.y;
      
      // Left Side: Challan Meta
      doc.fontSize(10).font('Helvetica-Bold').text('Challan Information', 50, topY);
      doc.font('Helvetica').text(`Number: ${challan.challanNumber}`, 50, topY + 15);
      doc.text(`Date: ${new Date(challan.createdAt).toLocaleString()}`, 50, topY + 30);
      doc.text(`Status: ${challan.status}`, 50, topY + 45);
      doc.text(`Created By: ${challan.createdBy?.name || 'Unknown'}`, 50, topY + 60);

      // Right Side: Customer Info
      doc.font('Helvetica-Bold').text('Customer Details', 350, topY);
      doc.font('Helvetica').text(challan.customer?.businessName || 'Unknown Customer', 350, topY + 15);
      doc.text(challan.customer?.mobile || '', 350, topY + 30);
      doc.text(challan.customer?.address || '', 350, topY + 45);

      doc.moveDown(4);

      // Table Header
      const tableTop = doc.y + 20;
      doc.font('Helvetica-Bold');
      doc.text('Product', 50, tableTop);
      doc.text('SKU', 250, tableTop);
      doc.text('Qty', 380, tableTop, { width: 30, align: 'right' });
      doc.text('Price', 430, tableTop, { width: 50, align: 'right' });
      doc.text('Total', 500, tableTop, { width: 50, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table Rows
      let y = tableTop + 25;
      doc.font('Helvetica');
      let grandTotal = 0;

      for (const item of challan.items) {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        const lineTotal = item.quantity * item.unitPrice;
        grandTotal += lineTotal;

        doc.text(item.productName, 50, y, { width: 190 });
        doc.text(item.sku, 250, y, { width: 120 });
        doc.text(item.quantity.toString(), 380, y, { width: 30, align: 'right' });
        doc.text(item.unitPrice.toLocaleString(), 430, y, { width: 50, align: 'right' });
        doc.text(lineTotal.toLocaleString(), 500, y, { width: 50, align: 'right' });
        
        y += 20;
      }

      doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
      
      // Totals
      y += 25;
      doc.font('Helvetica-Bold');
      doc.text('Total Quantity:', 350, y);
      doc.text(challan.totalQuantity.toString(), 500, y, { width: 50, align: 'right' });
      
      y += 20;
      doc.text('Grand Total:', 350, y);
      doc.text(`Rs ${grandTotal.toLocaleString()}`, 450, y, { width: 100, align: 'right' });

      // Footer
      doc.font('Helvetica').fontSize(8);
      const footerY = 750;
      doc.text(`Generated from Parth Mobile Distribution ERP | Challan Status: ${challan.status} | Printed: ${new Date().toLocaleString()}`, 50, footerY, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
