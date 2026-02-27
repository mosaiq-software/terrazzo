import {
    MAX_NAME_LENGTH,
    OrganizationHeader,
    OrganizationId,
    PermissionFlag,
    recordValues,
    UserId,
} from '@mosaiq/terrazzo-common';
import { createOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { organizationHandler } from './dataSources/objectHandlers/organization';
import { userIsValidMemberOfOrg } from './organizationAccess';
import { createRole } from './roleController';

export async function getOrganizationPreview(orgId: OrganizationId) {
    try {
        const orgHeader = await organizationHandler.read(orgId);
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

    // Create the organization record via handler
    const orgId = await organizationHandler.create(
        {
            name,
            logoUrl: organization.logoUrl || '',
            description: organization.description || '',
            ownerId: organization.ownerId,
        },
        { preventSync: true }
    );

    // Assign membership to creator
    const orgMembershipRecord = {
        orgId: orgId,
        userId: organization.ownerId,
        joinedAt: Date.now(),
    };
    await createOrganizationMembershipDb(orgMembershipRecord);

    // create default roles
    const adminRole = await createRole('Admin', '#D31757', orgId, recordValues(PermissionFlag));
    const guest = await createRole('Guest', '#2384CA', orgId, [PermissionFlag.VIEW_MODULES]);

    // assign admin role to creator
    await setRoleIdsForUserInOrgDb(organization.ownerId, orgId, [adminRole.id]);

    return orgId;
}
export async function updateOrganizationFromPartial(
    orgId: OrganizationId,
    partial: Partial<OrganizationHeader>,
    updatedBy?: UserId
) {
    const updatingOrg = await organizationHandler.read(orgId);
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

    await organizationHandler.update(orgId, partial, { preventSync: true });
}
