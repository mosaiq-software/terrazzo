import { Role } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const RoleModel = (sequelize: Sequelize): DbModel => {
    class RoleModel extends Model<Role> {
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
