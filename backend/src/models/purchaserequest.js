'use strict';
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class PurchaseRequest extends Model {
    static associate(models) {}
  }
  PurchaseRequest.init(
    {
      reference: DataTypes.STRING,
      warehouse_id: DataTypes.INTEGER,
      status: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'PurchaseRequest',
      timestamps: true
    }
  );
  return PurchaseRequest;
};