'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LinkedAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LinkedAccount.init({
    provider: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    accountId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    accountData: DataTypes.JSON,
    privateAccountData: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'LinkedAccount',
    timestamps: false
  });
  return LinkedAccount;
};