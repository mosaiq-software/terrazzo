import { AuthSession, UserId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class AuthSessionModel extends Model<AuthSession> {}
AuthSessionModel.init(
    {
        userId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        authToken: DataTypes.STRING,
        createdAt: DataTypes.BIGINT,
    },
    { sequelize, timestamps: false, tableName: 'AuthSessions' }
);

export const getAuthSessionByUserIdDb = async (userId: UserId) => {
    const model = await AuthSessionModel.findByPk(userId);
    return model?.toJSON();
};

export const getAuthSessionByAuthTokenDb = async (authToken: string) => {
    const model = await AuthSessionModel.findOne({ where: { authToken } });
    return model?.toJSON();
};

export const createAuthSessionDb = async (userId: UserId, authToken: string) => {
    const model = await AuthSessionModel.create({
        userId,
        authToken,
        createdAt: Date.now(),
    });
    return model.toJSON();
};

export const deleteAuthSessionByUserIdDb = async (userId: UserId) => {
    await AuthSessionModel.destroy({ where: { userId } });
};
