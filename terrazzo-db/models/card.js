'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Card extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Card.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        listId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        boardId: DataTypes.STRING,
        cardNumber: DataTypes.INTEGER,
        name: DataTypes.STRING,
        descriptionTextBlockId: DataTypes.STRING,
        priority: DataTypes.INTEGER,
        order: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        createdById: DataTypes.STRING,
        createdAt: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Card',
        timestamps: false
    });
    return Card;
};