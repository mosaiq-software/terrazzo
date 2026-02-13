import { LinkedAccount } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type LinkedAccountModelType = LinkedAccount;

export const getLinkedAccountModel = (sequelize: Sequelize): DbModel<LinkedAccountModelType> => {
    class LinkedAccountModel extends Model<LinkedAccountModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    LinkedAccountModel.init(
        {
            provider: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            accountId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            accountData: DataTypes.JSON,
            privateAccountData: {
                type: DataTypes.JSON,
                allowNull: true,
            },
        },
        { sequelize, timestamps: false, modelName: 'LinkedAccount' }
    );

    return LinkedAccountModel;
};
