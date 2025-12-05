import { MembershipRecord, OrganizationHeader, OrganizationId, OrgMembershipLevel, UserId } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { upsertOrganizationMembership } from '@trz-api/persistence/organizationMembershipPersistence';
import { createOrg, getOrgById, updateOrg } from '@trz-api/persistence/organizationPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';

export async function getOrganizationPreview(orgId: OrganizationId) {
    try {
        const orgHeader = await getOrgById(orgId);
        if (!orgHeader) {
            throw new Error('No Org found with id ' + orgId);
        }
        return orgHeader;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function addOrganization(name: string, creator: UserId) {
    if (name.length === 0 || name.length > 50) {
        throw new Error('Name must be 0 - 50 characters');
    }

    const user = await getUserHeaderByIdDb(creator);
    if (!user) {
        throw new Error('Org must have a creator');
    }

    const newOrg: OrganizationHeader = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        logoUrl: '',
        description: '',
    };

    const membershipRecord: MembershipRecord = {
        userId: creator,
        orgId: newOrg.id,
        permissionLevel: OrgMembershipLevel.ADMIN,
    };

    try {
        await createOrg(newOrg);
        await upsertOrganizationMembership(membershipRecord);
        return newOrg.id;
    } catch (e) {
        throw new Error('Failed to create org' + e);
    }
}

export async function updateOrganizationFromPartial(orgId: OrganizationId, partial: Partial<OrganizationHeader>) {
    const updatingOrg = await getOrgById(orgId);
    if (updatingOrg == null) {
        throw new Error('Org not found');
    }

    const updated = updateBaseFromPartial(updatingOrg, partial);
    try {
        await updateOrg(updated);
    } catch (e: any) {
        throw new Error('Failed to update org ' + e);
    }
}
