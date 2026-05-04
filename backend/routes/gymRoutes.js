import { Router } from 'express';
import {
  listGyms,
  createGym,
  updateGym,
  assignStaff,
} from '../controllers/gymController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  roleMiddleware,
  ownerRoles,
  managerRoles,
} from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(managerRoles), listGyms);
router.post('/', authMiddleware, roleMiddleware(ownerRoles), createGym);
router.patch('/:id', authMiddleware, roleMiddleware(ownerRoles), updateGym);
router.post(
  '/assign-staff',
  authMiddleware,
  roleMiddleware(managerRoles),
  assignStaff
);

export default router;
