import { z } from 'zod';

export const createProductSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
  minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative').default(0),
  warehouseLocation: z.string().min(1, 'Warehouse location is required'),
});

export const updateProductSchema = z.object({
  productName: z.string().min(1, 'Product name is required').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative').optional(),
  warehouseLocation: z.string().min(1, 'Warehouse location is required').optional(),
});
