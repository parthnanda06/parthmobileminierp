import { Router } from 'express';
import { getDashboardHandler } from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Available to all authenticated users; logic branches inside service based on role
router.get('/', getDashboardHandler);

export default router;
