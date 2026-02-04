import { CardAssignment } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const CardAssignmentModel = (sequelize: Sequelize): DbModel => {
    class CardAssignmentModel extends Model<CardAssignment> {
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
