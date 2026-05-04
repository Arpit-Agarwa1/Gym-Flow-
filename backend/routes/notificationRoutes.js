import { Router } from 'express';
import {
  listMine,
  sendNotification,
  markRead,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authMiddleware, listMine);
router.patch('/:id/read', authMiddleware, markRead);
router.post('/', authMiddleware, roleMiddleware(staffRoles), sendNotification);

export default router;
