import { UserHeader, UserId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model, Sequelize } from 'sequelize';

class UserModel extends Model {}
UserModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        username: DataTypes.STRING,
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        profilePicture: DataTypes.STRING,
        githubUserId: DataTypes.STRING,
    },
    { sequelize }
);

export const getUserById = async (id: UserId) => {
    return (await UserModel.findByPk(id))?.toJSON() as UserHeader | null;
};

export const getUserByUsername = async (username: string) => {
    return (await UserModel.findOne({ where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('username')), sequelize.fn('lower', username)) }))?.toJSON() as UserHeader | null;
};

export const getUserByGithubId = async (githubId: string) => {
    return (
        await UserModel.findOne({
            where: { githubUserId: githubId },
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        })
    )?.toJSON() as UserHeader | null;
};

export const getAllUsers = async () => {
    return (
        await UserModel.findAll({
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        })
    ).map((user) => user.toJSON() as UserHeader);
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
    return await UserModel.update(
        {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            githubUserId: user.githubUserId,
        },
        { where: { id: user.id } }
    );
};
