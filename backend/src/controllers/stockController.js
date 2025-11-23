import StockService from '../services/stockService.js';

class StockController {
    static async getAllStocks(req, res) {
        try {
            const stocks = await StockService.getAllStocks();
            res.status(200).json({ success: true, data: stocks });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async getStockById(req, res) {
        try {
            const { id } = req.params;
            const stock = await StockService.getStockById(id);
            if (!stock) {
                return res.status(404).json({ success: false, message: 'Stock not found' });
            }
            res.json({ success: true, data: stock });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async createStock(req, res) {
        try {
            const { warehouse_id, product_id, quantity } = req.body;
            const stock = await StockService.createStock({ warehouse_id, product_id, quantity });
            res.status(201).json({ success: true, data: stock });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { warehouse_id, product_id, quantity } = req.body;
            const stock = await StockService.updateStock(id, { warehouse_id, product_id, quantity });
            if (!stock) {
                return res.status(404).json({ success: false, message: 'Stock not found' });
            }
            res.json({ success: true, data: stock });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async deleteStock(req, res) {
        try {
            const { id } = req.params;
            const deleted = await StockService.deleteStock(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Stock not found' });
            }
            res.json({ success: true, message: 'Stock deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

export default StockController;