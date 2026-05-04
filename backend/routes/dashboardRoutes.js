import { Router } from 'express';
import { overview } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/overview', authMiddleware, roleMiddleware(staffRoles), overview);

export default router;
