'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrganizationMembership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrganizationMembership.init({
    userId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    orgId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    joinedAt: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OrganizationMembership',
    timestamps: false
  });
  return OrganizationMembership;
};