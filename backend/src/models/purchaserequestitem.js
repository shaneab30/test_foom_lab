import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class PurchaseRequestItem extends Model {
    static associate(models) {
      // define association here
    }
  }

  PurchaseRequestItem.init(
    {
      purchase_request_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PurchaseRequestItem",
      timestamps: true,
    }
  );

  return PurchaseRequestItem;
};