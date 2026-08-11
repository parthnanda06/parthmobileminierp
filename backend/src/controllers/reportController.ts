import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { getChallanReport, getInventoryReport, getStockMovementReport, getCustomerReport } from '../services/reportService';
import { Role } from '@prisma/client';

export const getChallansReportHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = req.query;
    
    // SALES role constraint
    if (req.user?.role === Role.SALES) {
      filters.createdById = req.user.userId;
    }

    const report = await getChallanReport(filters);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching challan report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch challan report' });
  }
};

export const getInventoryReportHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await getInventoryReport(req.query);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory report' });
  }
};

export const getStockMovementsReportHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await getStockMovementReport(req.query);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching stock movement report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock movement report' });
  }
};

export const getCustomersReportHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await getCustomerReport(req.query);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching customer report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer report' });
  }
};
