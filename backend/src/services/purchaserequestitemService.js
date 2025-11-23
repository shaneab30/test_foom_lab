import db from '../models/index.js';
const { PurchaseRequestItem } = db;

class PurchaseRequestItemService {
    static async getAllPurchaseRequestItems() {
        return await PurchaseRequestItem.findAll({
            attributes: ['id', 'purchase_request_id', 'product_id', 'quantity']
        });
    }

    static async getPurchaseRequestItemById(id) {
        return await PurchaseRequestItem.findByPk(id, {
            attributes: ['id', 'purchase_request_id', 'product_id', 'quantity']
        });
    }

    static async createPurchaseRequestItem(data) {
        return await PurchaseRequestItem.create({
            purchase_request_id: data.purchase_request_id,
            product_id: data.product_id,
            quantity: data.quantity
        });
    }

    static async createMultiplePurchaseRequestItems(items, options = {}) {
        return await PurchaseRequestItem.bulkCreate(items, options);
    }

    static async updatePurchaseRequestItem(id, data) {
        const purchaseRequestItem = await PurchaseRequestItem.findByPk(id);
        if (!purchaseRequestItem) return null;

        return purchaseRequestItem.update({
            purchase_request_id: data.purchase_request_id,
            product_id: data.product_id,
            quantity: data.quantity
        });
    }

    static async deletePurchaseRequestItem(id) {
        const purchaseRequestItem = await PurchaseRequestItem.findByPk(id);
        if (!purchaseRequestItem) return null;

        await purchaseRequestItem.destroy();
        return true;
    }

    static async getPurchaseRequestItemsByPRId(purchase_request_id) {
        return await PurchaseRequestItem.findAll({
            where: { purchase_request_id },
            attributes: ['id', 'purchase_request_id', 'product_id', 'quantity']
        });
    }
}

export default PurchaseRequestItemService;
