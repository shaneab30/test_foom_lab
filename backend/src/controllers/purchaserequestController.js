import { response } from "express";
import db from '../models/index.js';
const { sequelize } = db;
import PurchaseRequestService from "../services/purchaserequestService.js";
import PurchaseRequestItemService from "../services/purchaserequestitemService.js";
import axios from "axios";
import dotenv from "dotenv";
import ProductService from "../services/productService.js";

dotenv.config();


class PurchaseRequestController {
    static async getAllPurchaseRequests(req, res) {
        try {
            const purchaseRequests = await PurchaseRequestService.getAllPurchaseRequests();
            const items = await PurchaseRequestItemService.getAllPurchaseRequestItems();

            // Map items to their respective purchase requests
            const mappedItems = items.reduce((acc, item) => {
                if (!acc[item.purchase_request_id]) {
                    acc[item.purchase_request_id] = [];
                }
                acc[item.purchase_request_id].push(item);
                return acc;
            }, {});

            // Attach items to purchase requests
            purchaseRequests.forEach(pr => {
                pr.dataValues.items = mappedItems[pr.id] || [];
            });
            res.status(200).json({ success: true, data: purchaseRequests });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async getPurchaseRequestById(req, res) {
        try {
            const { id } = req.params;
            const purchaseRequest = await PurchaseRequestService.getPurchaseRequestById(id);

            if (!purchaseRequest) {
                return res.status(404).json({ success: false, message: 'Purchase request not found' });
            }

            const items = await PurchaseRequestItemService.getAllPurchaseRequestItems();
            purchaseRequest.dataValues.items = items.filter(item => item.purchase_request_id === purchaseRequest.id);

            res.status(200).json({ success: true, data: purchaseRequest });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async createPurchaseRequest(req, res) {
        const t = await sequelize.transaction();

        try {
            const { reference, warehouse_id, products } = req.body;

            const purchaseRequest = await PurchaseRequestService.createPurchaseRequest(
                { reference, warehouse_id, status: "DRAFT" },
                { transaction: t }
            );

            const items = products.map(product => ({
                purchase_request_id: purchaseRequest.id,
                product_id: product.product_id,
                quantity: product.quantity
            }));

            await PurchaseRequestItemService.createMultiplePurchaseRequestItems(items, { transaction: t });

            await t.commit();

            res.status(201).json({
                success: true,
                data: { purchaseRequest, items }
            });

        } catch (error) {
            await t.rollback();
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    static async updatePurchaseRequest(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { reference, warehouse_id, status, products } = req.body;

            const pr = await PurchaseRequestService.getPurchaseRequestById(id);
            if (!pr) {
                await t.rollback();
                return res.status(404).json({ success: false, message: "Not found" });
            }

            if (pr.status !== "DRAFT") {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Only DRAFT purchase requests can be updated"
                });
            }

            const updatedData = {
                reference: reference !== undefined ? reference : pr.reference,
                warehouse_id: warehouse_id !== undefined ? warehouse_id : pr.warehouse_id,
                status: status !== undefined ? status : pr.status
            };

            if (products && products.length > 0) {
                const existingItems = await PurchaseRequestItemService.getPurchaseRequestItemsByPRId(id);

                // Get existing product IDs
                const existingProductIds = existingItems.map(item => item.product_id);
                const newProductIds = products.map(p => p.product_id);

                // Items to delete (in existing but not in new)
                const itemsToDelete = existingItems.filter(
                    item => !newProductIds.includes(item.product_id)
                );

                // Items to update (in both existing and new)
                const itemsToUpdate = products.filter(p =>
                    existingProductIds.includes(p.product_id)
                );

                // Items to create (in new but not in existing)
                const itemsToCreate = products.filter(p =>
                    !existingProductIds.includes(p.product_id)
                );

                // Delete removed items
                for (const item of itemsToDelete) {
                    await PurchaseRequestItemService.deletePurchaseRequestItem(item.id, { transaction: t });
                }

                // Update existing items
                for (const product of itemsToUpdate) {
                    const existingItem = existingItems.find(
                        item => item.product_id === product.product_id
                    );
                    if (existingItem) {
                        await PurchaseRequestItemService.updatePurchaseRequestItem(
                            existingItem.id,
                            {
                                purchase_request_id: id,
                                product_id: product.product_id,
                                quantity: product.quantity
                            },
                            { transaction: t }
                        );
                    }
                }

                // Create new items
                if (itemsToCreate.length > 0) {
                    const newItems = itemsToCreate.map(product => ({
                        purchase_request_id: id,
                        product_id: product.product_id,
                        quantity: product.quantity
                    }));
                    await PurchaseRequestItemService.createMultiplePurchaseRequestItems(newItems, { transaction: t });
                }
            }

            const updated = await PurchaseRequestService.updatePurchaseRequest(id, updatedData);

            let foomHubResponse = null;


            if (updatedData.status === "PENDING") {
                let productsToSend;

                // always fetch product details from database, whether products provided or not
                if (products && products.length > 0) {
                    // Products provided in request - fetch their details from DB
                    productsToSend = await Promise.all(
                        products.map(async (item) => {
                            const product = await ProductService.getProductById(item.product_id);

                            return {
                                product_id: item.product_id,
                                product_name: product?.name || 'Unknown',
                                sku_barcode: product?.sku || '',
                                qty: item.quantity // use 'quantity' from request
                            };
                        })
                    );
                } else {
                    // No products provided - fetch from database
                    const existingItems = await PurchaseRequestItemService.getPurchaseRequestItemsByPRId(id);

                    if (!existingItems || existingItems.length === 0) {
                        await t.rollback();
                        return res.status(400).json({
                            success: false,
                            message: "No products found for this purchase request. Cannot set status to PENDING."
                        });
                    }

                    productsToSend = await Promise.all(
                        existingItems.map(async (item) => {
                            const product = await ProductService.getProductById(item.product_id);

                            return {
                                product_id: item.product_id,
                                product_name: product?.name || 'Unknown',
                                sku_barcode: product?.sku || '',
                                qty: item.quantity // use quantity from DB
                            };
                        })
                    );
                }

                const payload = {
                    vendor: "PT FOOM LAB GLOBAL",
                    reference: updated.reference,
                    qty_total: productsToSend.reduce((sum, p) => sum + (p.qty || 0), 0),
                    details: productsToSend.map(p => ({
                        product_name: p.product_name,
                        sku_barcode: p.sku_barcode,
                        qty: p.qty
                    }))
                };

                console.log("Sending payload to FOOM Hub:", payload);

                try {
                    const response = await axios.post(
                        "https://hub.foomid.id/api/request/purchase",
                        payload,
                        {
                            headers: {
                                "secret-key": process.env.FOOM_SECRET_KEY,
                                "Content-Type": "application/json"
                            },
                            timeout: 10000
                        }
                    );

                    foomHubResponse = response.data;
                    console.log("FOOM Hub Response:", foomHubResponse);

                } catch (apiError) {
                    await t.rollback();
                    console.error("FOOM Hub API Error:");
                    console.error("Status:", apiError.response?.status);
                    console.error("Data:", apiError.response?.data);
                    console.error("Message:", apiError.message);

                    return res.status(502).json({
                        success: false,
                        message: "Failed to sync with FOOM Hub",
                        error: apiError.response?.data || apiError.message
                    });
                }
            }
            await t.commit();

            res.json({
                success: true,
                data: updated,
                foomHubResponse: foomHubResponse
            });

        } catch (error) {
            await t.rollback();
            console.error("Controller Error:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    static async deletePurchaseRequest(req, res) {
        try {
            const { id } = req.params;
            const result = await PurchaseRequestService.deletePurchaseRequest(id);

            if (result.reason === "NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Purchase request not found"
                });
            }

            if (result.reason === "NOT_DRAFT") {
                return res.status(400).json({
                    success: false,
                    message: "Deletion not allowed. Only DRAFT requests can be deleted."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Purchase request deleted successfully"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default PurchaseRequestController;