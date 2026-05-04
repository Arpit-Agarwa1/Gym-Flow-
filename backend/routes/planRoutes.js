import { Router } from 'express';
import {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/membershipPlanController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles, managerRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(staffRoles), listPlans);
router.post('/', authMiddleware, roleMiddleware(managerRoles), createPlan);
router.patch('/:id', authMiddleware, roleMiddleware(managerRoles), updatePlan);
router.delete('/:id', authMiddleware, roleMiddleware(managerRoles), deletePlan);

export default router;
