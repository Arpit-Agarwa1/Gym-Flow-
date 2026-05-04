import { Router } from 'express';
import {
  listWorkouts,
  createWorkout,
  assignToMember,
  trackProgress,
} from '../controllers/workoutController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/', listWorkouts);
router.post('/', createWorkout);
router.post('/assign', assignToMember);
router.patch('/:id/progress', trackProgress);

export default router;
