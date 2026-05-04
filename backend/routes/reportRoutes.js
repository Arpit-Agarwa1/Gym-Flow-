import { Router } from 'express';
import {
  revenueReport,
  attendanceReport,
  membershipReport,
  analyticsDashboard,
} from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/revenue', revenueReport);
router.get('/attendance', attendanceReport);
router.get('/membership', membershipReport);
router.get('/analytics', analyticsDashboard);

export default router;
