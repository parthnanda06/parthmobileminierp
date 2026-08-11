import { Router } from 'express';
import { getStockMovementsHandler } from '../controllers/inventoryController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(Role.ADMIN, Role.WAREHOUSE));

router.get('/', getStockMovementsHandler);

export default router;
