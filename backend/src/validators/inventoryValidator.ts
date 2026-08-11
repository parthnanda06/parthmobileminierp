import { z } from 'zod';

export const addStockSchema = z.object({
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  reason: z.string().min(1, 'Reason is required'),
});
