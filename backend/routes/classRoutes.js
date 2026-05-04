import { Router } from 'express';
import {
  listClasses,
  createClass,
  bookClass,
  cancelBooking,
} from '../controllers/classController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/', listClasses);
router.post('/', createClass);
router.post('/:id/book', bookClass);
router.post('/:id/cancel', cancelBooking);

export default router;
