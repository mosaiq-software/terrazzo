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
        userId: DataTypes.STRING,
        roleId: DataTypes.STRING,
        orgId: DataTypes.STRING,
    },
    { sequelize, timestamps: false }
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
