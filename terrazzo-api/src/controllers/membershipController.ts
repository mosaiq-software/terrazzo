import { OrganizationId, UserId } from '@mosaiq/terrazzo-common/types';
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

export const getOrgsForUser = async (userId: UserId) => {
    const records = await getMembershipRecordForEntity(userId);
    const orgIds = records.map((r) => r.entityId);
    const orgs = await Promise.all(
        orgIds.map(async (id) => {
            const org = await getOrgById(id);
            return org;
        })
    );
    return orgs.filter((o) => !!o);
};
