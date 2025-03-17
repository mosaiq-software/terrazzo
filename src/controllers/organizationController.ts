import { EntityType, Role } from "@mosaiq/terrazzo-common/constants";
import { Organization, OrganizationHeader, OrganizationId, UserId } from "@mosaiq/terrazzo-common/types";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { createMembershipRecord, getMembershipRecordForEntity } from "@trz-api/persistence/membershipPersistence";
import { createOrg, getOrgById, updateOrg } from "@trz-api/persistence/organizationPersistence";
import { getProjectsByOrgId } from "@trz-api/persistence/projectPersistence";
import { getUserById } from "@trz-api/persistence/userPersistence";
import { getInvitesForEntity } from "./inviteController";
import { populateMemberships } from "./userController";

export async function getOrganizationPreview(orgId: OrganizationId) {
    try {
        const orgHeader = await getOrgById(orgId);
        if(!orgHeader) {
            throw new Error("No Org found with id "+orgId);
        }
        return orgHeader;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function getFullOrganization(orgId: OrganizationId) {
    const orgHeader = await getOrgById(orgId);
    if(!orgHeader) {
        throw new Error("No Org found with id "+orgId);
    }

    
    const org: Organization = {
        ...orgHeader,
        projects: await getProjectsByOrgId(orgId) ?? [],
        members: await getMembersInOrg(orgId) ?? [],
        invites: await getInvitesForEntity(orgId) ?? [],
    };
    return org;
}

export async function addOrganization(name:string, creator:UserId, isPersonal:boolean) {
    if(name.length === 0 || name.length > 50) {
        throw new Error("Name must be 0 - 50 characters");
    }

    const user = await getUserById(creator);
    if(!user){
        throw new Error("Org must have a creator");
    }

    const newOrg: OrganizationHeader = {
        id: crypto.randomUUID(),
        name,
        archived:false,
        createdAt: Date.now(),
        isPersonalOrg: isPersonal,
        logoUrl: "",
        description: "",
    };

    try{
        await createOrg(newOrg);
        await createMembershipRecord(creator, newOrg.id, EntityType.ORG, Role.OWNER);
        return newOrg.id;
    }catch (e) {
        throw new Error("Failed to create org" + e);
    }
}


export async function updateOrganizationFromPartial(orgId: OrganizationId, partial:Partial<OrganizationHeader>) {
    const updatingOrg = await getOrgById(orgId);
    if (updatingOrg == null) {
        throw new Error("Org not found");
    }

    const updated = updateBaseFromPartial<OrganizationHeader>(updatingOrg, partial);
    try {
        await updateOrg(updated);
    } catch (e:any) {
        throw new Error("Failed to update org "+e);
    }
}

export const getMembersInOrg = async (orgId: OrganizationId) => {
    const org = await getOrgById(orgId);
    if (org == null) {
        throw new Error("Org not found");
    }
    const records = await getMembershipRecordForEntity(orgId);
    const members = populateMemberships(records);
    return members;
}