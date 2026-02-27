import { OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { getOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { organizationHandler } from './dataSources/objectHandlers/organization';

export const userIsValidMemberOfOrg = async (userId: UserId, orgId: OrganizationId): Promise<boolean> => {
    const orgMembership = await getOrganizationMembershipDb(userId, orgId);
    return !!orgMembership;
};

export const userIsOrgOwner = async (userId: UserId, orgId: OrganizationId): Promise<boolean> => {
    const orgHeader = await organizationHandler.read(orgId);
    if (!orgHeader) {
        return false;
    }
    return orgHeader.ownerId === userId;
};
