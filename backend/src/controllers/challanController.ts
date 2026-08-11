import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { z } from 'zod';
import {
  getChallans,
  getChallanById,
  createDraft,
  updateDraft,
  confirmChallan,
  cancelChallan,
  generateChallanPdf
} from '../services/challanService';
import { createChallanSchema } from '../validators/challanValidator';

export const getChallansHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const customerId = req.query.customerId as string | undefined;

    const result = await getChallans({ page, limit, search, status, customerId });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in getChallansHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getChallanByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const challan = await getChallanById(id);

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (error) {
    console.error('Error in getChallanByIdHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createChallanHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = createChallanSchema.parse(req.body);
    const newChallan = await createDraft(validatedData, req.user.userId);
    
    res.status(201).json({
      success: true,
      data: newChallan,
      message: 'Challan created as DRAFT successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    if (error.message === 'CUSTOMER_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'One or more products not found' });
      return;
    }
    if (error.message === 'DUPLICATE_PRODUCTS') {
      res.status(400).json({ success: false, message: 'Duplicate products are not allowed in the same challan' });
      return;
    }
    console.error('Error in createChallanHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateChallanHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = createChallanSchema.parse(req.body);
    
    const updated = await updateDraft(id, validatedData);
    
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Challan draft updated successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      return;
    }
    if (error.message === 'CHALLAN_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }
    if (error.message === 'NOT_DRAFT') {
      res.status(400).json({ success: false, message: 'Only DRAFT challans can be edited' });
      return;
    }
    if (error.message === 'CUSTOMER_NOT_FOUND' || error.message === 'PRODUCT_NOT_FOUND' || error.message === 'DUPLICATE_PRODUCTS') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    console.error('Error in updateChallanHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const confirmChallanHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = req.params.id as string;
    
    const confirmed = await confirmChallan(id, req.user.userId);
    
    res.status(200).json({
      success: true,
      data: confirmed,
      message: 'Challan confirmed successfully'
    });
  } catch (error: any) {
    if (error.message === 'CHALLAN_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }
    if (error.message === 'ALREADY_CONFIRMED') {
      res.status(400).json({ success: false, message: 'Challan is already confirmed or cancelled' });
      return;
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({
        success: false,
        message: 'Insufficient stock',
        errors: error.details,
      });
      return;
    }
    console.error('Error in confirmChallanHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const cancelChallanHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const cancelled = await cancelChallan(id);
    
    res.status(200).json({
      success: true,
      data: cancelled,
      message: 'Challan cancelled successfully'
    });
  } catch (error: any) {
    if (error.message === 'CHALLAN_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }
    if (error.message === 'CANNOT_CANCEL_CONFIRMED') {
      res.status(400).json({ success: false, message: 'Confirmed challans cannot be cancelled because stock has already been deducted.' });
      return;
    }
    console.error('Error in cancelChallanHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const generateChallanPdfHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    // First verify they can get the challan (auth is handled by middleware, RBAC allows all 4 roles to view)
    const challan = await getChallanById(id);
    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    const pdfBuffer = await generateChallanPdf(challan);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${challan.challanNumber}.pdf"`);
    res.status(200).send(pdfBuffer);
    
  } catch (error) {
    console.error('Error in generateChallanPdfHandler:', error);
    res.status(500).json({ success: false, message: 'Unable to generate PDF' });
  }
};
