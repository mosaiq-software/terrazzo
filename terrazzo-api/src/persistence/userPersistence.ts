import { UserHeader, UserId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model, Sequelize } from 'sequelize';

class UserModel extends Model<UserHeader> {}
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
    },
    { sequelize, timestamps: false }
);

export const getUserHeaderByIdDb = async (id: UserId) => {
    const model = await UserModel.findByPk(id);
    return model?.toJSON();
};

export const getUserHeaderByUsernameDb = async (username: string) => {
    const model = await UserModel.findOne({ where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('username')), sequelize.fn('lower', username)) });
    return model?.toJSON();
};

export const createUserHeaderDb = async (user: UserHeader) => {
    const model = await UserModel.create({ ...user });
    return model?.toJSON();
};

export const updateUserHeaderDb = async (user: Partial<UserHeader> & { id: UserId }) => {
    const [updated] = await UserModel.update({ ...user }, { where: { id: user.id } });
    return updated;
};
