import { MembershipRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { syncMembersInOrg, syncUsersOrgs } from '@trz-api/broadcasters';
import {
    createOrganizationMembershipDb,
    deleteOrganizationMembershipDb,
    getOrganizationMembershipDb,
    getOrganizationMembershipsForOrgDb,
    getOrganizationMembershipsForUserDb,
} from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import { setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { userIsOrgOwner } from './organizationAccess';

export const getMembersInOrg = async (orgId: OrganizationId): Promise<UserId[]> => {
    const org = await getOrgByIdDb(orgId);
    if (org == null) {
        throw new Error('Org not found');
    }
    const records = await getOrganizationMembershipsForOrgDb(orgId);
    const members = records.map((r) => r.userId);
    return members;
};

export const getOrgsForUser = async (userId: UserId) => {
    const records = await getOrganizationMembershipsForUserDb(userId);
    const orgIds = records.map((r) => r.orgId);
    const orgs = await Promise.all(orgIds.map(async (id) => await getOrgByIdDb(id)));
    return orgs.filter((o) => !!o);
};

export const createMembershipIfDoesntExist = async (membershipRecord: MembershipRecord) => {
    const existingMemberships = await getOrganizationMembershipDb(membershipRecord.userId, membershipRecord.orgId);
    if (existingMemberships) {
        return;
    }
    await createOrganizationMembershipDb(membershipRecord);
};

export const removeMembership = async (userId: UserId, orgId: OrganizationId) => {
    const isOwner = await userIsOrgOwner(userId, orgId);
    if (isOwner) {
        throw new Error('Cannot remove membership for the owner of the organization');
    }
    await deleteOrganizationMembershipDb(userId, orgId);
    await setRoleIdsForUserInOrgDb(userId, orgId, []);
    await syncMembersInOrg(orgId);
    await syncUsersOrgs(userId);
};
