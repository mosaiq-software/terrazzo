import { CardAssignment } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type CardAssignmentModelType = CardAssignment;

export const getCardAssignmentModel = (sequelize: Sequelize): DbModel<CardAssignmentModelType> => {
    class CardAssignmentModel extends Model<CardAssignmentModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    CardAssignmentModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            userId: DataTypes.STRING,
            cardId: DataTypes.STRING,
        },
        { sequelize, timestamps: false, modelName: 'CardAssignment' }
    );

    return CardAssignmentModel;
};
