import { Router } from 'express';
import {
  getCustomersHandler,
  getCustomerByIdHandler,
  createCustomerHandler,
  updateCustomerHandler,
  createFollowUpHandler
} from '../controllers/customerController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// Secure all customer routes
router.use(authenticate);
router.use(authorizeRoles(Role.ADMIN, Role.SALES));

router.get('/', getCustomersHandler);
router.get('/:id', getCustomerByIdHandler);
router.post('/', createCustomerHandler);
router.put('/:id', updateCustomerHandler);
router.post('/:id/followups', createFollowUpHandler);

export default router;
