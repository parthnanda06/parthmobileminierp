import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowUp
} from '../services/customerService';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema
} from '../validators/customerValidator';
import { z } from 'zod';

export const getCustomersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const customerType = req.query.customerType as string | undefined;

    const result = await getCustomers({ page, limit, search, status, customerType });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in getCustomersHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCustomerByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await getCustomerById(id);

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Error in getCustomerByIdHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createCustomerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createCustomerSchema.parse(req.body);
    const newCustomer = await createCustomer(validatedData);
    
    res.status(201).json({
      success: true,
      data: newCustomer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    console.error('Error in createCustomerHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateCustomerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = updateCustomerSchema.parse(req.body);
    
    const existing = await getCustomerById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const updated = await updateCustomer(id, validatedData);
    
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    console.error('Error in updateCustomerHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createFollowUpHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = req.params.id as string;
    const validatedData = createFollowUpSchema.parse(req.body);

    const existing = await getCustomerById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const followUp = await addFollowUp(id, req.user.userId, validatedData);

    res.status(201).json({
      success: true,
      data: followUp,
      message: 'Follow-up added successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    console.error('Error in createFollowUpHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
