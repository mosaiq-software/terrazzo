import { OrganizationId, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export interface RoleAssignment {
    userId: UserId;
    roleId: RoleId;
    orgId: OrganizationId;
}

export const getRoleAssignmentModel = (sequelize: Sequelize): DbModel<RoleAssignment> => {
    class RoleAssignmentModel extends Model<RoleAssignment> {
        static associate(db: Db) {
            // define association here
        }
    }
    RoleAssignmentModel.init(
        {
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            roleId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            orgId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        { sequelize, timestamps: false, modelName: 'RoleAssignment' }
    );

    return RoleAssignmentModel;
};
