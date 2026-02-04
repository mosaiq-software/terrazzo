import { Role } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type RoleModelType = Role;

export const getRoleModel = (sequelize: Sequelize): DbModel<RoleModelType> => {
    class RoleModel extends Model<RoleModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    RoleModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            orgId: DataTypes.STRING,
            name: DataTypes.STRING,
            color: DataTypes.STRING,
            order: DataTypes.INTEGER,
            defaultPermissions: DataTypes.JSON,
        },
        { sequelize, timestamps: false, modelName: 'Role' }
    );

    return RoleModel;
};
