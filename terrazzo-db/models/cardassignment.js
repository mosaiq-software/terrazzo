'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CardAssignment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    CardAssignment.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        userId: DataTypes.STRING,
        cardId: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'CardAssignment',
        timestamps: false
    });
    return CardAssignment;
};