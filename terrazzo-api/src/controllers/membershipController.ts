import { OrganizationId } from '@mosaiq/terrazzo-common/types';
import { getMembershipRecordForEntity } from '@trz-api/persistence/membershipPersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { populateMemberships } from './userController';

export const getMembersInOrg = async (orgId: OrganizationId) => {
    const org = await getOrgById(orgId);
    if (org == null) {
        throw new Error('Org not found');
    }
    const records = await getMembershipRecordForEntity(orgId);
    const members = populateMemberships(records);
    return members;
};
