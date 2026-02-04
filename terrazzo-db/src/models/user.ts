import { UserHeader } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const getUserModel = (sequelize: Sequelize): DbModel<UserHeader> => {
    class UserModel extends Model<UserHeader> {
        static associate(db: Db) {
            // define association here
        }
    }
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
        { sequelize, timestamps: false, modelName: 'User' }
    );

    return UserModel;
};
