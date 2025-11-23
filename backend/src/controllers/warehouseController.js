import WarehouseService from '../services/warehouseService.js';

class WarehouseController {
    static async getAllWarehouses(req, res) {
        try {
            const warehouses = await WarehouseService.getAllWarehouses();
            res.status(200).json({ success: true, data: warehouses });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async getWarehouseById(req, res) {
        try {
            const { id } = req.params;
            const warehouse = await WarehouseService.getWarehouseById(id);
            if (!warehouse) {
                return res.status(404).json({ success: false, message: 'Warehouse not found' });
            }
            res.json({ success: true, data: warehouse });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async createWarehouse(req, res) {
        try {
            const { name } = req.body;

            const checkExisting = await WarehouseService.findByName(name);
            if (checkExisting) {
                return res.status(400).json({ success: false, message: 'Warehouse name already exists' });
            }

            const warehouse = await WarehouseService.createWarehouse({ name });
            res.status(201).json({ success: true, data: warehouse });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async updateWarehouse(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const checkExisting = await WarehouseService.findByName(name);
            if (checkExisting && checkExisting.id !== parseInt(id, 10)) {
                return res.status(400).json({ success: false, message: 'Warehouse name already exists' });
            }
            
            const warehouse = await WarehouseService.updateWarehouse(id, { name });
            if (!warehouse) {
                return res.status(404).json({ success: false, message: 'Warehouse not found' });
            }
            res.json({ success: true, data: warehouse });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async deleteWarehouse(req, res) {
        try {
            const { id } = req.params;
            const deleted = await WarehouseService.deleteWarehouse(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Warehouse not found' });
            }
            res.json({ success: true, message: 'Warehouse deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

export default WarehouseController;