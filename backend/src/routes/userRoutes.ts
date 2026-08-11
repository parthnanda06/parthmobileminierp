import { Router } from 'express';
import {
  getUsersHandler,
  createUserHandler,
  updateUserHandler,
  resetPasswordHandler
} from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
// ONLY ADMIN can access user management
router.use(authorizeRoles(Role.ADMIN));

router.get('/', getUsersHandler);
router.post('/', createUserHandler);
router.put('/:id', updateUserHandler);
router.patch('/:id/password', resetPasswordHandler);

export default router;
