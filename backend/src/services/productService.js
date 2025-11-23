import db from '../models/index.js';
const { Product } = db;

class ProductService {
  static async getAllProducts() {
    return await Product.findAll({
      attributes: ['id', 'name', 'sku']
    });
  }

  static async getProductById(id) {
    return Product.findByPk(id, {
      attributes: ['id', 'name', 'sku']
    });
  }

  static async createProduct(data) {
    return Product.create({
      name: data.name,
      sku: data.sku
    });
  }

  static async updateProduct(id, data) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    return product.update({
      name: data.name,
      sku: data.sku
    });
  }

  static async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    await product.destroy();
    return true;
  }

  static async findBySku(sku) {
    return Product.findOne({ where: { sku } });
  }
}

export default ProductService;
