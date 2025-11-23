import db from '../models/index.js';
const { Warehouse } = db;

class WarehouseService {
    static async getAllWarehouses() {
        return await Warehouse.findAll({
            attributes: ['id', 'name']
        });
    }

    static async getWarehouseById(id) {
        return await Warehouse.findByPk(id, {
            attributes: ['id', 'name']
        });
    }

    static async createWarehouse(data) {
        return await Warehouse.create({
            name: data.name
        });
    }

    static async updateWarehouse(id, data) {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) return null;

        return warehouse.update({
            name: data.name
        });
    }

    static async deleteWarehouse(id) {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) return null;

        await warehouse.destroy();
        return true;
    }

    static async findByName(name) {
        return Warehouse.findOne({ where: { name } });
    }
}

export default WarehouseService;
