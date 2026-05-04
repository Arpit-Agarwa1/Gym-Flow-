import { Router } from 'express';
import {
  listDiets,
  createDiet,
  assignDiet,
} from '../controllers/dietController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/', listDiets);
router.post('/', createDiet);
router.post('/assign', assignDiet);

export default router;
