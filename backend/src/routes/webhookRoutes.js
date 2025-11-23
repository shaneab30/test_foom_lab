import express from 'express';
import WebhookController from '../controllers/webhookController.js';

const router = express.Router();

router.post('/receive-stock', WebhookController.receiveStock);

export default router;
