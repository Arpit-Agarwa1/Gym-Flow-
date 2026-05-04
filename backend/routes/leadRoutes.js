import { Router } from 'express';
import {
  listLeads,
  addLead,
  updateLead,
  convertLead,
} from '../controllers/leadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/', listLeads);
router.post('/', addLead);
router.patch('/:id', updateLead);
router.post('/:id/convert', convertLead);

export default router;
