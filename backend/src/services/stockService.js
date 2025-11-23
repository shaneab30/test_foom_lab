import db from '../models/index.js';
const { Stock } = db;

class StockService {
    static async getAllStocks() {
        return await Stock.findAll({
            attributes: ['id', 'warehouse_id', 'product_id', 'quantity']
        });
    }

    static async getStockById(id) {
        return Stock.findByPk(id, {
            attributes: ['id', 'warehouse_id', 'product_id', 'quantity']
        });
    }

    static async createStock(data) {
        return Stock.create({
            warehouse_id: data.warehouse_id,
            product_id: data.product_id,
            quantity: data.quantity
        });
    }

    static async updateStock(id, data) {
        const stock = await Stock.findByPk(id);
        if (!stock) return null;

        return stock.update({
            warehouse_id: data.warehouse_id,
            product_id: data.product_id,
            quantity: data.quantity
        });
    }

    static async deleteStock(id) {
        const stock = await Stock.findByPk(id);
        if (!stock) return null;

        await stock.destroy();
        return true;
    }

    static async addStock(data, options = {}) {
        const stock = await Stock.findOne({
            where: {
                warehouse_id: data.warehouse_id,
                product_id: data.product_id
            }
        });

        if (stock) {
            return stock.increment('quantity', { by: data.quantity, ...options });
        } else {
            return Stock.create({
                warehouse_id: data.warehouse_id,
                product_id: data.product_id,
                quantity: data.quantity
            }, options);
        }
    }
}

export default StockService;
