'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoleAssignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoleAssignment.init({
    userId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    orgId: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'RoleAssignment',
    timestamps: false
  });
  return RoleAssignment;
};