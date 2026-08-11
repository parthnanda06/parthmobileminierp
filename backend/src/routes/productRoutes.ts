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
router.use(authorizeRoles(Role.ADMIN, Role.WAREHOUSE));

router.get('/', getProductsHandler);
router.get('/:id', getProductByIdHandler);
router.post('/', createProductHandler);
router.put('/:id', updateProductHandler);

// Stock IN API
router.post('/:id/stock-in', addStockHandler);

export default router;
