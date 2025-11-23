import db from '../models/index.js';
const { sequelize } = db;
import PurchaseRequestService from '../services/purchaserequestService.js';
import ProductService from '../services/productService.js';
import StockService from '../services/stockService.js'; 

class WebhookController {
    static async receiveStock(req, res) {
        const t = await sequelize.transaction();

        try {
            const { vendor, reference, qty_total, details } = req.body;

            // Validate required fields
            if (!vendor || !reference || !details || !Array.isArray(details)) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Invalid webhook payload. Required: vendor, reference, details[]"
                });
            }

            // Verify vendor
            if (vendor !== "PT FOOM LAB GLOBAL") {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Invalid vendor. Only 'PT FOOM LAB GLOBAL' is accepted."
                });
            }

            console.log(`Received stock webhook for reference: ${reference}`);

            // Logic Requirement 1: Warehouse Lookup
            const purchaseRequest = await PurchaseRequestService.getPurchaseRequestByReference(reference);

            if (!purchaseRequest) {
                await t.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Purchase request with reference '${reference}' not found`
                });
            }

            const warehouseId = purchaseRequest.warehouse_id;
            console.log(`Warehouse ID: ${warehouseId}`);

            if (purchaseRequest.status === "COMPLETED") {
                await t.rollback();
                return res.status(200).json({
                    success: true,
                    message: "Stock already processed for this purchase request",
                    alreadyProcessed: true
                });
            }

            if (purchaseRequest.status !== "PENDING") {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Cannot process stock. Purchase request status is '${purchaseRequest.status}'. Expected 'PENDING'.`
                });
            }
            // error collection
            const errors = [];
            const stockUpdates = [];

            // process each item in details

            for (const item of details) {
                const { product_name, sku_barcode, qty } = item;

                if (!sku_barcode || !qty) {
                    errors.push({
                        product_name,
                        sku_barcode,
                        error: "Missing sku_barcode or qty"
                    });
                    continue;
                }

                const product = await ProductService.findBySku(sku_barcode);

                if (!product) {
                    errors.push({
                        product_name,
                        sku_barcode,
                        error: "Product not found in system"
                    });
                    continue;
                }

                try {
                    await StockService.addStock({
                        warehouse_id: warehouseId,
                        product_id: product.id,
                        quantity: qty
                    }, { transaction: t });

                    // get updated stock info for response
                    const updatedStock = await StockService.getStockById(product.id);

                    const stockInfo = {
                        product_id: product.id,
                        product_name: product.name,
                        sku_barcode: sku_barcode,
                        quantity_added: qty,
                        new_stock_level: updatedStock.quantity
                    };

                    stockUpdates.push(stockInfo);

                    console.log(`Added ${qty} units of ${product.name} (SKU: ${sku_barcode})`);

                } catch (stockError) {
                    errors.push({
                        product_name,
                        sku_barcode,
                        error: stockError.message
                    });
                }
            }
            const totalProcessed = stockUpdates.reduce((sum, item) => sum + item.quantity_added, 0);
            if (qty_total && totalProcessed !== qty_total) {
                console.warn(`Warning: qty_total (${qty_total}) doesn't match actual total (${totalProcessed})`);
            }

            if (errors.length > 0 && stockUpdates.length === 0) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Failed to process any stock items",
                    errors: errors
                });
            }

            await PurchaseRequestService.updatePurchaseRequest(
                purchaseRequest.id,
                { status: "COMPLETED" },
                { transaction: t }
            );

            console.log(`Purchase request ${reference} marked as COMPLETED`);

            await t.commit();

            return res.status(200).json({
                success: true,
                message: "Stock received and processed successfully",
                data: {
                    purchase_request_id: purchaseRequest.id,
                    reference: reference,
                    warehouse_id: warehouseId,
                    qty_total: qty_total,
                    items_processed: stockUpdates.length,
                    items_failed: errors.length,
                    stock_updates: stockUpdates,
                    errors: errors.length > 0 ? errors : undefined
                }
            });


        } catch (error) {
            await t.rollback();
            console.error("Webhook Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
}

export default WebhookController;