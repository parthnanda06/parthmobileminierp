import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

const mobileRegex = /^[6-9]\d{9}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const createCustomerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  mobile: z.string().regex(mobileRegex, 'Invalid Indian mobile number'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  businessName: z.string().min(1, 'Business name is required'),
  gstNumber: z.string().regex(gstRegex, 'Invalid GST number format').optional().or(z.literal('')),
  customerType: z.nativeEnum(CustomerType, { message: 'Invalid customer type' }),
  address: z.string().min(1, 'Address is required'),
  status: z.nativeEnum(CustomerStatus).default('ACTIVE'),
  followUpDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  note: z.string().min(1, 'Note is required'),
  followUpDate: z.string().min(1, 'Follow-up date is required'),
});
