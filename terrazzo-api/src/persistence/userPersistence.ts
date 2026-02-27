import { UserHeader, UserId } from '@mosaiq/terrazzo-common';
import { CacheEntity, UserModel, getCached, invalidateCache, sequelize } from '@mosaiq/terrazzo-db';
import { Sequelize } from 'sequelize';

export const getUserHeaderByIdDb = async (id: UserId) => {
    return getCached(CacheEntity.User, id, async () => {
        const model = await UserModel.findByPk(id);
        return model?.toJSON();
    });
};

export const getUserHeaderByUsernameDb = async (username: string) => {
    const model = await UserModel.findOne({
        where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('username')), sequelize.fn('lower', username)),
    });
    return model?.toJSON();
};

export const createUserHeaderDb = async (user: UserHeader) => {
    const model = await UserModel.create({ ...user });
    return model?.toJSON();
};

export const updateUserHeaderDb = async (id: UserId, user: Partial<UserHeader>) => {
    const [updated] = await UserModel.update({ ...user }, { where: { id } });
    await invalidateCache(CacheEntity.User, id);
    return updated;
};
