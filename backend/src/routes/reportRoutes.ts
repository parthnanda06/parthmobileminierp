import { Router } from 'express';
import {
  getChallansReportHandler,
  getInventoryReportHandler,
  getStockMovementsReportHandler,
  getCustomersReportHandler
} from '../controllers/reportController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Allowed: ADMIN, SALES, ACCOUNTS
router.get('/challans', authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS), getChallansReportHandler);

// Allowed: ADMIN, WAREHOUSE
router.get('/inventory', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), getInventoryReportHandler);

// Allowed: ADMIN, WAREHOUSE
router.get('/stock-movements', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), getStockMovementsReportHandler);

// Allowed: ADMIN, SALES
router.get('/customers', authorizeRoles(Role.ADMIN, Role.SALES), getCustomersReportHandler);

export default router;
