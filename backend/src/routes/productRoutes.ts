import { Router } from 'express';
import {
  getProductsHandler,
  getProductByIdHandler,
  createProductHandler,
  updateProductHandler
} from '../controllers/productController';
import { addStockHandler } from '../controllers/inventoryController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.get('/', getProductsHandler);
router.get('/:id', getProductByIdHandler);

router.post('/', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), createProductHandler);
router.put('/:id', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), updateProductHandler);

// Stock IN API
router.post('/:id/stock-in', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), addStockHandler);

export default router;
