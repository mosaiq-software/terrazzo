import { Role } from "@mosaiq/terrazzo-common/constants";
import { Organization, OrganizationId, UserId } from "@mosaiq/terrazzo-common/types";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { createMembershipRecord } from "@trz-api/persistence/membershipPersistence";
import { createOrg, getOrgById, updateOrg } from "@trz-api/persistence/organizationPersistence";

export async function addOrganization(name:string, creator:UserId, isPersonal:boolean) {
    if(name.length === 0 || name.length > 50) {
        throw new Error("Name must be 0 - 50 characters");
    }

    // const user = await getUser(creator)...
    // if(!user){
    //     throw new Error("Org must have a creator");
    // }

    const newOrg: Organization = {
        id: crypto.randomUUID(),
        name,
        archived:false,
        createdAt: Date.now(),
        isPersonalOrg: isPersonal,
        logoUrl: "",
        projects: []
    };

    try{
        await createOrg(newOrg);
        await createMembershipRecord(creator, newOrg.id, Role.OWNER);
        return newOrg.id;
    }catch (e) {
        throw new Error("Failed to create org" + e);
    }
}


export async function updateOrganizationFromPartial(orgId: OrganizationId, partial:Partial<Organization>) {
    const updatingOrg = await getOrgById(orgId);
    if (updatingOrg == null) {
        throw new Error("Org not found");
    }

    const updated = updateBaseFromPartial<Organization>(updatingOrg, partial);
    try {
        await updateOrg(updated);
    } catch (e:any) {
        throw new Error("Failed to update org "+e);
    }
}