import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { User } from '@mosaiq/terrazzo-common/types';

class UserModel extends Model {}
UserModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    githubUserId: DataTypes.STRING,
}, { sequelize, modelName: 'userModel' });

sequelize.sync();


export const getUserById = async (id: string) => {
    return (await UserModel.findByPk(id))?.toJSON() as User | null;
};

export const getUserByDiscordId = async (discordId: string) => {
    return (await UserModel.findOne({ where: { discordUserId: discordId } }))?.toJSON() as User | null;
};

export const getUserByGithubId = async (githubId: string) => {
    return (await UserModel.findOne({ where: { githubUserId: githubId } }))?.toJSON() as User | null;
};

export const createUser = async (user: User) => {
    return await UserModel.create({
        id: user.id,
        githubUserId: user.githubUserId,
    });
};

export const updateUser = async (user: User) => {
    return await UserModel.update({
        githubUserId: user.githubUserId,
    }, { where: { id: user.id } });
};

export const setActiveTimer = async (userId: string, timerId: string | null) => {
    if (!timerId) {
        timerId = null;
    }
    return await UserModel.update({ activeTimerId: timerId }, { where: { id: userId } });
};

export const setUserArchived = async (id: string, archived: boolean) => {
    return await UserModel.update({ archived }, { where: { id } });
};