import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import * as ic from '../controllers/integrationController.js';

const router = Router();

router.use(apiKeyAuth);
router.get('/search', ic.integrationSearch);

export default router;
