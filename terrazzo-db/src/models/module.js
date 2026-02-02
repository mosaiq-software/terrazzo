'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Module extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Module.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    parentId: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    order: DataTypes.INTEGER,
    archived: DataTypes.BOOLEAN,
    createdAt: DataTypes.INTEGER,
    orgId: DataTypes.STRING,
    desiredPermissions: DataTypes.JSON,
    effectivePermissions: DataTypes.JSON,
    public: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Module',
    timestamps: false
  });
  return Module;
};