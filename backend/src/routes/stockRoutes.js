import express from 'express';
import StockController from '../controllers/stockController.js';

const router = express.Router();

router.get('/', StockController.getAllStocks);
router.get('/:id', StockController.getStockById);
router.post('/', StockController.createStock);
router.put('/:id', StockController.updateStock);
router.delete('/:id', StockController.deleteStock);
    
export default router;
