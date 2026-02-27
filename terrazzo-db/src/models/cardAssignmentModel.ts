import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';
import { UserId, CardId } from '@mosaiq/terrazzo-common';

export type CardAssignmentModelType = {
    userId: UserId;
    cardId: CardId;
};

export const getCardAssignmentModel = (sequelize: Sequelize): DbModel<CardAssignmentModelType> => {
    class CardAssignmentModel extends Model<CardAssignmentModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    CardAssignmentModel.init(
        {
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            cardId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        { sequelize, timestamps: false, modelName: 'CardAssignment' }
    );

    return CardAssignmentModel;
};
