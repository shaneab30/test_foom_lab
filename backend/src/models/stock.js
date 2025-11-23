import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      // define association here if needed
    }
  }

  Stock.init(
    {
      warehouse_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Stock",
      timestamps: true,
    }
  );

  return Stock;
};