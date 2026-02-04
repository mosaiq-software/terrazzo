import { AuthSession } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type AuthSessionModelType = AuthSession;

export const getAuthSessionModel = (sequelize: Sequelize): DbModel<AuthSessionModelType> => {
    class AuthSessionModel extends Model<AuthSessionModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    AuthSessionModel.init(
        {
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            authToken: DataTypes.STRING,
            createdAt: DataTypes.BIGINT,
        },
        { sequelize, timestamps: false, modelName: 'AuthSession' }
    );

    return AuthSessionModel;
};
