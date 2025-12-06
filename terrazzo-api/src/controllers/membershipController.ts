import { Member, MembershipRecord, OrganizationId, OrgMembershipLevel, UserId } from '@mosaiq/terrazzo-common';
import { deleteOrganizationMembership, getOrganizationMembershipsForOrg, getOrganizationMembershipsForUser, updateOrganizationMembership, upsertOrganizationMembership } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';

export const getMembersInOrg = async (orgId: OrganizationId) => {
    const org = await getOrgById(orgId);
    if (org == null) {
        throw new Error('Org not found');
    }
    const records = await getOrganizationMembershipsForOrg(orgId);
    const members = populateMemberships(records);
    return members;
};

const populateMemberships = async (records: MembershipRecord[]) => {
    const members = (
        await Promise.all(
            records.map(async (r) => {
                return {
                    record: r,
                    user: await getUserHeaderByIdDb(r.userId),
                };
            })
        )
    ).filter((m) => !!m.user) as Member[];
    return members;
};

export const getOrgsForUser = async (userId: UserId) => {
    const records = await getOrganizationMembershipsForUser(userId);
    const orgIds = records.map((r) => r.orgId);
    const orgs = await Promise.all(orgIds.map(async (id) => await getOrgById(id)));
    return orgs.filter((o) => !!o);
};

export const upsertMembership = async (membershipRecord: MembershipRecord) => {
    return await upsertOrganizationMembership(membershipRecord);
};

export const updateMembership = async (userId: UserId, orgId: OrganizationId, newLevel: OrgMembershipLevel) => {
    const record: MembershipRecord = {
        userId,
        orgId,
        permissionLevel: newLevel,
    };
    await updateOrganizationMembership(record);
};

export const removeMembership = async (userId: UserId, orgId: OrganizationId) => {
    await deleteOrganizationMembership(userId, orgId);
};
