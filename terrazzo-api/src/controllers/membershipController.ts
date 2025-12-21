import { Member, MembershipRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { syncMembersInOrg, syncUsersOrgs } from '@trz-api/broadcasters';
import { createOrganizationMembershipDb, deleteOrganizationMembershipDb, getOrganizationMembershipDb, getOrganizationMembershipsForOrgDb, getOrganizationMembershipsForUserDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import { setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import { userIsOrgOwner } from './organizationController';

export const getMembersInOrg = async (orgId: OrganizationId) => {
    const org = await getOrgByIdDb(orgId);
    if (org == null) {
        throw new Error('Org not found');
    }
    const records = await getOrganizationMembershipsForOrgDb(orgId);
    const members = await populateMemberships(records);
    return members;
};

const populateMemberships = async (records: MembershipRecord[]) => {
    const memberPromises = records.map(async (r) => {
        const user = await getUserHeaderByIdDb(r.userId);
        if (!user) {
            return undefined;
        }
        const member: Member = {
            user: user,
            ...r,
        };
        return member;
    });
    const membersWithUndefined = await Promise.all(memberPromises);
    const members = membersWithUndefined.filter((m) => !!m);
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
