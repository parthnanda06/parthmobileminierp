import { Router } from 'express';
import { updateProfile, updatePassword } from '../controllers/settingsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.put('/profile', updateProfile);
router.put('/password', updatePassword);

export default router;
