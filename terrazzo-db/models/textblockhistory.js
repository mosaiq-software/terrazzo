'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TextBlockHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TextBlockHistory.init({
    snapshotId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    textBlockId: DataTypes.STRING,
    timestamp: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    tags: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'TextBlockHistory',
    timestamps: false
  });
  return TextBlockHistory;
};