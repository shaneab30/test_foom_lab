import express from 'express';
import PurchaseRequestController from '../controllers/purchaserequestController.js';

const router = express.Router();

router.get('/', PurchaseRequestController.getAllPurchaseRequests);
router.get('/:id', PurchaseRequestController.getPurchaseRequestById);
router.post('/', PurchaseRequestController.createPurchaseRequest);
router.put('/:id', PurchaseRequestController.updatePurchaseRequest);
router.delete('/:id', PurchaseRequestController.deletePurchaseRequest);

export default router;
