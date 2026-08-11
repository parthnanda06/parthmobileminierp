import { Router } from 'express';
import {
  getChallansHandler,
  getChallanByIdHandler,
  createChallanHandler,
  updateChallanHandler,
  confirmChallanHandler,
  cancelChallanHandler,
  generateChallanPdfHandler
} from '../controllers/challanController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// View endpoints available to all roles
router.get('/', getChallansHandler);
router.get('/:id', getChallanByIdHandler);
router.get('/:id/pdf', generateChallanPdfHandler);

// Mutating endpoints restricted to ADMIN and SALES
router.post('/', authorizeRoles(Role.ADMIN, Role.SALES), createChallanHandler);
router.put('/:id', authorizeRoles(Role.ADMIN, Role.SALES), updateChallanHandler);
router.post('/:id/confirm', authorizeRoles(Role.ADMIN, Role.SALES), confirmChallanHandler);
router.post('/:id/cancel', authorizeRoles(Role.ADMIN, Role.SALES), cancelChallanHandler);

export default router;
