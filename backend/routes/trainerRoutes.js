import { Router } from 'express';
import {
  listTrainers,
  getTrainer,
  createTrainer,
  updateTrainer,
  assignMembers,
  trainerSchedule,
} from '../controllers/trainerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles, managerRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/', listTrainers);
router.get('/:id', getTrainer);
router.get('/:id/schedule', trainerSchedule);
router.post('/', roleMiddleware(managerRoles), createTrainer);
router.patch('/:id', roleMiddleware(managerRoles), updateTrainer);
router.patch('/:id/members', assignMembers);

export default router;
