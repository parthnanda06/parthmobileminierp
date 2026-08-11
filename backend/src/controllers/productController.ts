import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
} from '../services/productService';
import { createProductSchema, updateProductSchema } from '../validators/productValidator';

export const getProductsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const lowStock = req.query.lowStock === 'true';

    const result = await getProducts({ page, limit, search, category, lowStock });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in getProductsHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProductByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await getProductById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error in getProductByIdHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createProductHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = createProductSchema.parse(req.body);
    const newProduct = await createProduct(validatedData, req.user.userId);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    if (error.message === 'DUPLICATE_SKU') {
      res.status(409).json({ success: false, message: 'A product with this SKU already exists' });
      return;
    }
    console.error('Error in createProductHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProductHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = updateProductSchema.parse(req.body);
    
    const existing = await getProductById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const updated = await updateProduct(id, validatedData);
    
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    if (error.message === 'DUPLICATE_SKU') {
      res.status(409).json({ success: false, message: 'A product with this SKU already exists' });
      return;
    }
    console.error('Error in updateProductHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
