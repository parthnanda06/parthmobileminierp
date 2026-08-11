import prisma from '../config/database';
import { MovementType, Prisma } from '@prisma/client';

export const addStock = async (productId: string, quantity: number, reason: string, createdById: string) => {
  return prisma.$transaction(async (tx) => {
    // Read current product stock
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    // currentStock += quantity
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: { increment: quantity },
      },
    });

    // Create StockMovement
    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        movementType: MovementType.IN,
        reason,
        createdById,
      },
    });

    return { product: updatedProduct, movement };
  });
};

export const getStockMovements = async ({
  page = 1,
  limit = 10,
  productId,
  movementType,
}: {
  page?: number;
  limit?: number;
  productId?: string;
  movementType?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.StockMovementWhereInput = {};

  if (productId) {
    where.productId = productId;
  }

  if (movementType && movementType !== 'ALL') {
    where.movementType = movementType as MovementType;
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { productName: true, sku: true } },
        createdBy: { select: { name: true, role: true } },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
