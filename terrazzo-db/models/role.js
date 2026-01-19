'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Role.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    orgId: DataTypes.STRING,
    name: DataTypes.STRING,
    color: DataTypes.STRING,
    order: DataTypes.INTEGER,
    defaultPermissions: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Role',
    timestamps: false
  });
  return Role;
};