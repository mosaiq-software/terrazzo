import { OrganizationId, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

export interface RoleAssignment {
    userId: UserId;
    roleId: RoleId;
    orgId: OrganizationId;
}
class RoleAssignmentModel extends Model<RoleAssignment> {}
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
    { sequelize, timestamps: false, tableName: 'RoleAssignments' }
);

export const getRoleIdsForUserInOrgDb = async (userId: UserId, orgId: OrganizationId): Promise<RoleId[]> => {
    const model = await RoleAssignmentModel.findAll({ where: { userId, orgId } });
    return model.map((m) => m.toJSON().roleId);
};

export const setRoleIdsForUserInOrgDb = async (userId: UserId, orgId: OrganizationId, roleIds: RoleId[]) => {
    await RoleAssignmentModel.destroy({ where: { userId, orgId } });
    const assignments = roleIds.map((roleId) => ({
        userId,
        roleId,
        orgId,
    }));
    await RoleAssignmentModel.bulkCreate(assignments);
};
