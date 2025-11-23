import express from 'express';
import WarehouseController from '../controllers/warehouseController.js';

const router = express.Router();

router.get('/', WarehouseController.getAllWarehouses);
router.get('/:id', WarehouseController.getWarehouseById);
router.post('/', WarehouseController.createWarehouse);
router.put('/:id', WarehouseController.updateWarehouse);
router.delete('/:id', WarehouseController.deleteWarehouse);

export default router;
