import { Router, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/admin', authorizeRoles(Role.ADMIN), (req, res: Response) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
});

router.get('/sales', authorizeRoles(Role.SALES), (req, res: Response) => {
  res.status(200).json({ success: true, message: 'Sales access granted' });
});

router.get('/warehouse', authorizeRoles(Role.WAREHOUSE), (req, res: Response) => {
  res.status(200).json({ success: true, message: 'Warehouse access granted' });
});

router.get('/accounts', authorizeRoles(Role.ACCOUNTS), (req, res: Response) => {
  res.status(200).json({ success: true, message: 'Accounts access granted' });
});

export default router;
