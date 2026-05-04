import { Router } from 'express';
import {
  manualCheckIn,
  qrCheckIn,
  attendanceHistory,
  memberQrPayload,
} from '../controllers/attendanceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/qr', qrCheckIn); // kiosk / scanner can call without staff login if you expose it
router.use(authMiddleware);

router.post('/manual', roleMiddleware(staffRoles), manualCheckIn);
router.get('/', roleMiddleware(staffRoles), attendanceHistory);
router.get(
  '/qr/:memberId',
  roleMiddleware(staffRoles),
  memberQrPayload
);

export default router;
