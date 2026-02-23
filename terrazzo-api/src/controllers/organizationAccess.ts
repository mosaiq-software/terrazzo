import { OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { getOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';

export const userIsValidMemberOfOrg = async (userId: UserId, orgId: OrganizationId): Promise<boolean> => {
    const orgMembership = await getOrganizationMembershipDb(userId, orgId);
    return !!orgMembership;
};

export const userIsOrgOwner = async (userId: UserId, orgId: OrganizationId): Promise<boolean> => {
    const orgHeader = await getOrgByIdDb(orgId);
    if (!orgHeader) {
        return false;
    }
    return orgHeader.ownerId === userId;
};
