'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Define associations here when needed
    }
  }

  Product.init(
    {
      name: DataTypes.STRING,
      sku: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Product',
      timestamps: true,
    }
  );

  return Product;
};