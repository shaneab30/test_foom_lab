import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Warehouse extends Model {
    static associate(models) {
      // define association here
    }
  }

  Warehouse.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Warehouse',
      timestamps: true,
    }
  );

  return Warehouse;
};