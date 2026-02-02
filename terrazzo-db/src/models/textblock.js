'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TextBlock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TextBlock.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    text: DataTypes.TEXT,
    type: DataTypes.STRING,
    trackHistory: DataTypes.BOOLEAN,
    lastSnapshotAt: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TextBlock',
    timestamps: false
  });
  return TextBlock;
};