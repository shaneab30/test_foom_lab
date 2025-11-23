import ProductService from '../services/productService.js';

class ProductController {
    static async getAllProducts(req, res) {
        try {
            const products = await ProductService.getAllProducts();
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.getProductById(id);

            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            res.json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async createProduct(req, res) {
        try {
            const { name, sku } = req.body;

            const existingProduct = await ProductService.findBySku(sku);
            if (existingProduct) {
                return res.status(400).json({ success: false, message: 'SKU already exists' });
            }

            const product = await ProductService.createProduct({ name, sku });

            res.status(201).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, sku } = req.body;

            const existingProduct = await ProductService.getProductById(id);
            if (!existingProduct) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            const productWithSameSku = await ProductService.findBySku(sku);
            if (productWithSameSku && productWithSameSku.id !== parseInt(id, 10)) {
                return res.status(400).json({ success: false, message: 'SKU already exists' });
            }

            // update product
            const updated = await ProductService.updateProduct(id, { name, sku });
            res.json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const deleted = await ProductService.deleteProduct(id);

            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            res.json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

export default ProductController;
