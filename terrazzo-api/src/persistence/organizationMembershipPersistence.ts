import { MembershipRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { OrganizationMembershipModel } from '@mosaiq/terrazzo-db';

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
