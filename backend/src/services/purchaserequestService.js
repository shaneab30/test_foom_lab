import db from '../models/index.js';
const { PurchaseRequest } = db;

class PurchaseRequestService {
    static async getAllPurchaseRequests() {
        return await PurchaseRequest.findAll();
    }

    static async getPurchaseRequestById(id) {
        return await PurchaseRequest.findByPk(id);
    }

    static async createPurchaseRequest(data, options = {}) {
        return await PurchaseRequest.create(
            {
                reference: data.reference,
                warehouse_id: data.warehouse_id,
                status: data.status
            },
            options
        );
    }

    static async updatePurchaseRequest(id, data, options = {}) {
        const purchaseRequest = await PurchaseRequest.findByPk(id);
        if (!purchaseRequest) return null;

        return purchaseRequest.update(data, options);
    }

    static async deletePurchaseRequest(id) {
        const purchaseRequest = await PurchaseRequest.findByPk(id);
        if (!purchaseRequest) return { deleted: false, reason: "NOT_FOUND" };

        if (purchaseRequest.status !== "DRAFT") {
            return { deleted: false, reason: "NOT_DRAFT" };
        }

        await purchaseRequest.destroy();
        return { deleted: true };
    }

    static async getPurchaseRequestByReference(reference) {
        return await PurchaseRequest.findOne({
            where: { reference }
        });
    }
}

export default PurchaseRequestService;
