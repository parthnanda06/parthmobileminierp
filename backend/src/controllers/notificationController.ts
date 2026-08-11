import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import prisma from '../config/database';
import { Role } from '@prisma/client';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user?.role;
    const userId = req.user?.userId;
    const notifications: any[] = [];

    // Helper to add notification
    const addNotif = (title: string, message: string, type: 'info' | 'warning' | 'success' | 'error', time: Date) => {
      notifications.push({ id: Math.random().toString(36).substr(2, 9), title, message, type, time });
    };

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (role === Role.ADMIN || role === Role.WAREHOUSE) {
      // Low stock products
      const lowStockProducts = await prisma.product.findMany({
        where: { currentStock: { lte: prisma.product.fields.minimumStock } },
        take: 5
      });
      lowStockProducts.forEach(p => {
        addNotif('Low Stock Alert', `${p.productName} is low on stock (${p.currentStock} remaining).`, p.currentStock === 0 ? 'error' : 'warning', new Date());
      });

      // Recent Draft Challans waiting for fulfillment
      const pendingChallans = await prisma.challan.findMany({
        where: { status: 'DRAFT', createdAt: { gte: oneDayAgo } },
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      pendingChallans.forEach(c => {
        addNotif('New Order Pending', `Challan ${c.challanNumber} needs confirmation.`, 'info', c.createdAt);
      });
    }

    if (role === Role.ADMIN || role === Role.SALES) {
      // Follow-ups due today or overdue
      const followUps = await prisma.customerFollowUp.findMany({
        where: {
          followUpDate: { lte: todayEnd },
          createdById: role === Role.SALES ? userId : undefined
        },
        include: { customer: true },
        take: 5,
        orderBy: { followUpDate: 'desc' }
      });
      followUps.forEach(f => {
        addNotif('Follow-up Due', `Follow-up required for ${f.customer.businessName}.`, 'warning', f.followUpDate);
      });

      // Recent Challan confirmations/cancellations (if SALES, only their own)
      const updatedChallans = await prisma.challan.findMany({
        where: {
          status: { in: ['CONFIRMED', 'CANCELLED'] },
          updatedAt: { gte: oneDayAgo },
          createdById: role === Role.SALES ? userId : undefined
        },
        take: 5,
        orderBy: { updatedAt: 'desc' }
      });
      updatedChallans.forEach(c => {
        addNotif(`Order ${c.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}`, `Challan ${c.challanNumber} was ${c.status.toLowerCase()}.`, c.status === 'CONFIRMED' ? 'success' : 'error', c.updatedAt);
      });
    }

    if (role === Role.ACCOUNTS) {
      // Accounts only needs to know about confirmed challans ready for invoicing
      const confirmedChallans = await prisma.challan.findMany({
        where: { status: 'CONFIRMED', updatedAt: { gte: oneDayAgo } },
        take: 5,
        orderBy: { updatedAt: 'desc' }
      });
      confirmedChallans.forEach(c => {
        addNotif('New Confirmed Order', `Challan ${c.challanNumber} is ready for invoicing.`, 'success', c.updatedAt);
      });
    }

    // Sort notifications by time descending
    notifications.sort((a, b) => b.time.getTime() - a.time.getTime());

    res.status(200).json({ success: true, data: notifications.slice(0, 10) }); // Top 10 max
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};
