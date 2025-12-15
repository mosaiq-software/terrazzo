import { OrganizationHeader, OrganizationId, PermissionFlag, recordValues, updateBaseFromPartial, UserId } from '@mosaiq/terrazzo-common';
import { getOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { createOrgDb, getOrgByIdDb, updateOrgDb } from '@trz-api/persistence/organizationPersistence';
import { setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import { createRole } from './roleController';

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
        ownerId: creator,
    };

    await createOrgDb(newOrg);
    await seedFreshOrg(newOrg.id, creator);

    return newOrg.id;
}

const seedFreshOrg = async (orgId: OrganizationId, creator: UserId) => {
    // create default roles
    const adminRole = await createRole('Admin', '#D31757', orgId, recordValues(PermissionFlag));
    const guest = await createRole('Guest', '#2384CA', orgId, [PermissionFlag.VIEW_BOARD, PermissionFlag.VIEW_DOCUMENT]);

    // assign admin role to creator
    await setRoleIdsForUserInOrgDb(creator, orgId, [adminRole.id]);
};

export const userIsValidMemberOfOrg = async (userId: UserId, orgId: OrganizationId): Promise<boolean> => {
    const userHeader = await getUserHeaderByIdDb(userId);
    if (!userHeader) {
        return false;
    }
    const orgMembership = await getOrganizationMembershipDb(userId, orgId);
    return !!orgMembership;
};

export async function updateOrganizationFromPartial(orgId: OrganizationId, partial: Partial<OrganizationHeader>, updatedBy?: UserId) {
    const updatingOrg = await getOrgByIdDb(orgId);
    if (updatingOrg == null) {
        throw new Error('Org not found');
    }

    // Check if ownership is being transferred
    if (partial.ownerId && partial.ownerId !== updatingOrg.ownerId) {
        if (!updatedBy) {
            throw new Error('Must specify user performing update to transfer ownership');
        }
        if (updatingOrg.ownerId !== updatedBy) {
            throw new Error('Only the current owner can transfer ownership');
        }
        if (!(await userIsValidMemberOfOrg(partial.ownerId, orgId))) {
            throw new Error('New owner must be a member of the organization');
        }
    }

    const updated = updateBaseFromPartial(updatingOrg, partial);
    try {
        await updateOrgDb(updated);
    } catch (e: any) {
        throw new Error('Failed to update org ' + e);
    }
}

export const userIsOrgOwner = async (userId: UserId, orgId: OrganizationId): Promise<boolean> => {
    const orgHeader = await getOrgByIdDb(orgId);
    if (!orgHeader) {
        return false;
    }
    return orgHeader.ownerId === userId;
};
