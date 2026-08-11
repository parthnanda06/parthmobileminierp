import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';
import { addStock, getStockMovements } from '../services/inventoryService';
import { addStockSchema } from '../validators/inventoryValidator';

export const addStockHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const productId = req.params.id as string;
    const validatedData = addStockSchema.parse(req.body);

    const result = await addStock(
      productId,
      validatedData.quantity,
      validatedData.reason,
      req.user.userId
    );

    res.status(201).json({
      success: true,
      data: result,
      message: 'Stock added successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    console.error('Error in addStockHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStockMovementsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const productId = req.query.productId as string | undefined;
    const movementType = req.query.movementType as string | undefined;

    const result = await getStockMovements({ page, limit, productId, movementType });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in getStockMovementsHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
