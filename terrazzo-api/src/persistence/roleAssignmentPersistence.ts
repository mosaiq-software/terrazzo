import { OrganizationId, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { RoleAssignmentModel } from '@mosaiq/terrazzo-db';

export interface RoleAssignment {
    userId: UserId;
    roleId: RoleId;
    orgId: OrganizationId;
}

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
