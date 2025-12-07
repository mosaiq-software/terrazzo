import { MembershipRecord, OrganizationHeader, OrganizationId, PermissionFlag, recordValues, updateBaseFromPartial, UserId } from '@mosaiq/terrazzo-common';
import { createOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { createOrgDb, getOrgByIdDb, updateOrgDb } from '@trz-api/persistence/organizationPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import { addRoleToUserInOrg, createRole } from './roleController';

export async function getOrganizationPreview(orgId: OrganizationId) {
    try {
        const orgHeader = await getOrgByIdDb(orgId);
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

    await createOrgDb(newOrg);
    await seedFreshOrg(newOrg.id, creator);

    return newOrg.id;
}

const seedFreshOrg = async (orgId: OrganizationId, creator: UserId) => {
    // Add creator as member
    const membershipRecord: MembershipRecord = {
        userId: creator,
        orgId: orgId,
        joinedAt: Date.now(),
    };
    await createOrganizationMembershipDb(membershipRecord);

    // create default roles
    const adminRole = await createRole('Admin', '#D31757', orgId, recordValues(PermissionFlag));
    const guest = await createRole('Guest', '#2384CA', orgId, [PermissionFlag.VIEW_BOARD, PermissionFlag.VIEW_DOCUMENT]);

    // assign admin role to creator
    await addRoleToUserInOrg(creator, orgId, adminRole.id);
};

export async function updateOrganizationFromPartial(orgId: OrganizationId, partial: Partial<OrganizationHeader>) {
    const updatingOrg = await getOrgByIdDb(orgId);
    if (updatingOrg == null) {
        throw new Error('Org not found');
    }

    const updated = updateBaseFromPartial(updatingOrg, partial);
    try {
        await updateOrgDb(updated);
    } catch (e: any) {
        throw new Error('Failed to update org ' + e);
    }
}
