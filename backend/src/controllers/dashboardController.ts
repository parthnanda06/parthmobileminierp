import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { getDashboardMetrics } from '../services/dashboardService';

export const getDashboardHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const result = await getDashboardMetrics(req.user.userId, req.user.role as any);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in getDashboardHandler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
