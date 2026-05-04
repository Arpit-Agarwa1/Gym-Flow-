import { Router } from 'express';
import {
  listMembers,
  getMember,
  addMember,
  updateMember,
  deleteMember,
  freezeMembership,
  assignTrainer,
} from '../controllers/memberController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/', listMembers);
router.get('/:id', getMember);
router.post('/', addMember);
router.patch('/:id', updateMember);
router.delete('/:id', deleteMember);
router.patch('/:id/freeze', freezeMembership);
router.patch('/:id/trainer', assignTrainer);

export default router;
