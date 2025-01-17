import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';

const router = Router();

router.post('/subscribe', SubscriptionController.subscribe);
router.get('/status', SubscriptionController.getSubscriptionStatus);

export default router;
