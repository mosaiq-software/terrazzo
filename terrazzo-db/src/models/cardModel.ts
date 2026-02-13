import { CardHeader } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type CardModelType = CardHeader;

export const getCardModel = (sequelize: Sequelize): DbModel<CardModelType> => {
    class CardModel extends Model<CardModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    CardModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            listId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            boardId: DataTypes.STRING,
            cardNumber: DataTypes.INTEGER,
            name: DataTypes.STRING,
            descriptionTextBlockId: DataTypes.STRING,
            priority: DataTypes.INTEGER,
            order: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            createdById: DataTypes.STRING,
            createdAt: DataTypes.NUMBER,
        },
        { sequelize, timestamps: false, modelName: 'Card' }
    );

    return CardModel;
};
