import { AuthSession } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const getAuthSessionModel = (sequelize: Sequelize): DbModel<AuthSession> => {
    class AuthSessionModel extends Model<AuthSession> {
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
