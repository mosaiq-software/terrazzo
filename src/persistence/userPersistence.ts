import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { User } from '@mosaiq/terrazzo-common/types';

class UserModel extends Model {}
UserModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    username: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    profilePicture: DataTypes.STRING,
    githubUserId: DataTypes.STRING,
    activeTimerId: DataTypes.STRING,
    archived: DataTypes.BOOLEAN
}, { sequelize, modelName: 'userModel' });

sequelize.sync();


export const getUserById = async (id: string) => {
    return (await UserModel.findByPk(id))?.toJSON() as User | null;
};

export const getUserByUsername = async (username: string) => {
    return (await UserModel.findOne({ where: { username } }))?.toJSON() as User | null;
}

export const getUserByGithubId = async (githubId: string) => {
    return (await UserModel.findOne({
        where: { githubUserId: githubId },
        attributes:{
            exclude:['createdAt', 'updatedAt']
        }}))?.toJSON() as User | null;
};

export const findOrCreateUser = async (user: User) => {
    return await UserModel.upsert({
        where: { id: user.id },
        defaults: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            githubUserId: user.githubUserId,
            activeTimerId: user.activeTimerId,
            archived: false
        }
    });
};

export const createUser = async (user: User) => {
    return await UserModel.create({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        githubUserId: user.githubUserId,
        activeTimerId: user.activeTimerId,
        archived: false
    });
};

export const updateUser = async (user: User) => {
    return await UserModel.update({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        activeTimerId: user.activeTimerId,
        archived: user.archived
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