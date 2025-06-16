import {Model, DataTypes, Sequelize} from 'sequelize';
import { sequelize } from '@trz-api/utils/dbHelper';
import { UserHeader, UserId } from '@mosaiq/terrazzo-common/types';

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
}, { sequelize});


export const getUserById = async (id: UserId) => {
    return (await UserModel.findByPk(id))?.toJSON() as UserHeader | null;
};

export const getUserByUsername = async (username: string) => {
    return (await UserModel.findOne({ where:
            Sequelize.where(
                Sequelize.fn('lower',
                    Sequelize.col('username')
                ),
                sequelize.fn('lower', username))
    }))?.toJSON() as UserHeader | null;
}

export const getUserByGithubId = async (githubId: string) => {
    return (await UserModel.findOne({
        where: { githubUserId: githubId },
        attributes:{
            exclude:['createdAt', 'updatedAt']
        }}))?.toJSON() as UserHeader | null;
};

export const findOrCreateUser = async (user: UserHeader) => {
    return await UserModel.upsert({
        where: { id: user.id },
        defaults: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            githubUserId: user.githubUserId,
            archived: false
        }
    });
};

export const createUser = async (user: UserHeader) => {
    return await UserModel.create({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        githubUserId: user.githubUserId,
    });
};

export const updateUser = async (user: UserHeader) => {
    return await UserModel.update({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        githubUserId: user.githubUserId,
    }, { where: { id: user.id } });
};