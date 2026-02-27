import { MembershipRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { OrganizationMembershipModel } from '@mosaiq/terrazzo-db';
import { Op } from 'sequelize';

export const getOrganizationMembershipDb = async (userId: UserId, orgId: OrganizationId) => {
    const model = await OrganizationMembershipModel.findOne({ where: { userId, orgId } });
    return model?.toJSON();
};

export const getOrganizationMembershipsForUserDb = async (userId: UserId) => {
    const models = await OrganizationMembershipModel.findAll({ where: { userId } });
    return models.map((membership) => membership.toJSON());
};

export const getOrganizationMembershipsForOrgDb = async (orgId: OrganizationId) => {
    const models = await OrganizationMembershipModel.findAll({ where: { orgId } });
    return models.map((membership) => membership.toJSON());
};

export const createOrganizationMembershipDb = async (membershipRecord: MembershipRecord) => {
    await OrganizationMembershipModel.create({ ...membershipRecord });
};

export const deleteOrganizationMembershipDb = async (userId: UserId, orgId: OrganizationId) => {
    const deleted = await OrganizationMembershipModel.destroy({ where: { userId, orgId } });
    return deleted;
};

export const getMemberUserIdsByOrgIdDb = async (orgId: OrganizationId): Promise<UserId[]> => {
    const models = await OrganizationMembershipModel.findAll({ attributes: ['userId'], where: { orgId } });
    return models.map((m) => m.toJSON().userId);
};

export const addMembersToOrgDb = async (orgId: OrganizationId, userIds: UserId[]): Promise<void> => {
    const existing = await getMemberUserIdsByOrgIdDb(orgId);
    const existingSet = new Set<UserId>(existing);
    const toAdd = userIds.filter((id) => !existingSet.has(id));
    await OrganizationMembershipModel.bulkCreate(toAdd.map((userId) => ({ userId, orgId, joinedAt: Date.now() })));
};

export const removeMembersFromOrgDb = async (orgId: OrganizationId, userIds: UserId[]): Promise<void> => {
    await OrganizationMembershipModel.destroy({
        where: { orgId, userId: { [Op.in]: userIds } },
    });
};
