import { Router } from 'express';
import {
  listContents,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers/contentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/', listContents);
router.post('/', createContent);
router.patch('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;
