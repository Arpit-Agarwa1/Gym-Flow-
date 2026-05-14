import { Router } from 'express';
import {
  createPayment,
  paymentHistory,
  patchPayment,
  razorpayCreateOrder,
  razorpayVerify,
  invoicePdf,
  deletePayment,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  roleMiddleware,
  staffRoles,
  managerRoles,
} from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(staffRoles));

router.post('/', createPayment);
router.get('/', paymentHistory);
router.post('/razorpay/order', razorpayCreateOrder);
router.post('/razorpay/verify', razorpayVerify);
router.patch('/:id', patchPayment);
/** Correcting mistakes / fraud review — owners & managers only */
router.delete('/:id', roleMiddleware(managerRoles), deletePayment);
router.get('/:id/invoice.pdf', invoicePdf);

export default router;
