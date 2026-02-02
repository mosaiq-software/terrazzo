'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Invite.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    forOrganizationId: DataTypes.STRING,
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    uses: DataTypes.INTEGER,
    createdById: DataTypes.STRING,
    createdAt: DataTypes.STRING,
    revokedAt: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Invite',
    timestamps: false
  });
  return Invite;
};