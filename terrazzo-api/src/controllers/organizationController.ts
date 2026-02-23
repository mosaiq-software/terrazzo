import {
    MAX_NAME_LENGTH,
    OrganizationHeader,
    OrganizationId,
    PermissionFlag,
    recordValues,
    UserId,
} from '@mosaiq/terrazzo-common';
import { syncUpdateOrgField } from '@trz-api/broadcasters';
import {
    createOrganizationMembershipDb,
} from '@trz-api/persistence/organizationMembershipPersistence';
import { createOrgDb, getOrgByIdDb, updateOrgDb } from '@trz-api/persistence/organizationPersistence';
import { setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { userIsOrgOwner, userIsValidMemberOfOrg } from './organizationAccess';
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

export async function addOrganization(organization: Partial<OrganizationHeader> & { name: string; ownerId: UserId }) {
    const name = organization.name?.trim();
    if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
        throw new Error(`Name must be 1 - ${MAX_NAME_LENGTH} characters`);
    }

    // Create the organization record
    const newOrg: OrganizationHeader = {
        id: crypto.randomUUID(),
        name,
        createdAt: organization.createdAt || Date.now(),
        logoUrl: organization.logoUrl || '',
        description: organization.description || '',
        ownerId: organization.ownerId,
    };
    await createOrgDb(newOrg);

    // Assign membership to creator
    const orgMembershipRecord = {
        orgId: newOrg.id,
        userId: organization.ownerId,
        joinedAt: Date.now(),
    };
    await createOrganizationMembershipDb(orgMembershipRecord);

    // create default roles
    const adminRole = await createRole('Admin', '#D31757', newOrg.id, recordValues(PermissionFlag));
    const guest = await createRole('Guest', '#2384CA', newOrg.id, [PermissionFlag.VIEW_MODULES]);

    // assign admin role to creator
    await setRoleIdsForUserInOrgDb(organization.ownerId, newOrg.id, [adminRole.id]);

    return newOrg.id;
}
export async function updateOrganizationFromPartial(
    orgId: OrganizationId,
    partial: Partial<OrganizationHeader>,
    updatedBy?: UserId
) {
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

    const updated = { ...updatingOrg, ...partial };
    await updateOrgDb(updated);
    await syncUpdateOrgField(orgId, { ...partial, id: orgId });
}
