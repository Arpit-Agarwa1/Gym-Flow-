import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  roleMiddleware,
  managerRoles,
  staffRoles,
} from '../middleware/roleMiddleware.js';
import * as p from '../controllers/platformController.js';

const router = Router();

router.use(authMiddleware);
router.get('/search', roleMiddleware(staffRoles), p.globalSearch);

router.use(roleMiddleware(managerRoles));

router.get('/audit-logs', p.listAuditLogs);

router.post('/referrals/:memberId/generate', p.generateReferralCode);
router.get('/referrals/stats', p.referralStats);

router.get('/trial-passes', p.listTrialPasses);
router.post('/trial-passes', p.createTrialPass);
router.delete('/trial-passes/:id', p.deleteTrialPass);

router.get('/subscriptions', p.listSubscriptions);
router.post('/subscriptions', p.createSubscription);
router.patch('/subscriptions/:id', p.patchSubscription);

router.get('/waiver-templates', p.listWaiverTemplates);
router.post('/waiver-templates', p.createWaiverTemplate);
router.post('/waivers/sign', p.signWaiver);

router.get('/products', p.listProducts);
router.post('/products', p.createProduct);
router.patch('/products/:id', p.updateProduct);
router.delete('/products/:id', p.deleteProduct);
router.post('/sales', p.createSale);

router.get('/shifts', p.listShifts);
router.post('/shifts', p.createShift);
router.delete('/shifts/:id', p.deleteShift);

router.get('/task-templates', p.listTaskTemplates);
router.post('/task-templates', p.createTaskTemplate);
router.get('/task-runs', p.listTaskRuns);
router.post('/task-runs/complete', p.completeTaskRun);

router.get('/campaigns', p.listCampaigns);
router.post('/campaigns', p.createCampaign);
router.post('/campaigns/:id/send', p.sendCampaignNow);

router.get('/webhooks', p.listWebhooks);
router.post('/webhooks', p.createWebhook);
router.delete('/webhooks/:id', p.deleteWebhook);

router.get('/api-keys', p.listApiKeys);
router.post('/api-keys', p.createApiKey);
router.delete('/api-keys/:id', p.deleteApiKey);

router.get('/search', p.globalSearch);

router.post('/reminders/run', p.runRenewalReminders);

router.get('/backup/export', p.backupExport);

router.get('/members/:memberId/gdpr-export', p.gdprExportMember);
router.post('/members/:memberId/gdpr-anonymize', p.gdprAnonymizeMember);

router.get('/franchise/summary', p.franchiseSummary);

export default router;
