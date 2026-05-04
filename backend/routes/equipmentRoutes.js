import { Router } from 'express';
import {
  listEquipment,
  addEquipment,
  updateEquipment,
} from '../controllers/equipmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware, staffRoles, managerRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.get('/', listEquipment);
router.post('/', roleMiddleware(managerRoles), addEquipment);
router.patch('/:id', roleMiddleware(managerRoles), updateEquipment);

export default router;
