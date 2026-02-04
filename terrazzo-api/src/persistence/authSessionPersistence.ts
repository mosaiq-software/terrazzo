import { UserId } from '@mosaiq/terrazzo-common';
import { AuthSessionModel } from '@mosaiq/terrazzo-db';

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
