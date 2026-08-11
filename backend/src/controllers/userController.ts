import { Request, Response } from 'express';
import { z } from 'zod';
import {
  getUsers,
  createUser,
  updateUser,
  resetPassword
} from '../services/userService';
import { createUserSchema, updateUserSchema, updatePasswordSchema } from '../validators/userValidator';

export const getUsersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await getUsers({ page, limit, search, role, status });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in getUsersHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const newUser = await createUser(validatedData);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'Employee created successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    if (error.message === 'EMAIL_EXISTS') {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }
    console.error('Error in createUserHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = updateUserSchema.parse(req.body);
    
    const updated = await updateUser(id, validatedData);
    
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Employee updated successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (error.message === 'EMAIL_EXISTS') {
      res.status(409).json({ success: false, message: 'Email already in use by another user' });
      return;
    }
    if (error.message === 'LAST_ADMIN') {
      res.status(400).json({ success: false, message: 'At least one active administrator is required.' });
      return;
    }
    console.error('Error in updateUserHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = updatePasswordSchema.parse(req.body);
    
    const result = await resetPassword(id, validatedData.password);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    console.error('Error in resetPasswordHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
