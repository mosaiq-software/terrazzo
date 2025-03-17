import { OrganizationId, Project, ProjectHeader, ProjectId,} from "@mosaiq/terrazzo-common/types";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { getBoardsByProjectId } from "@trz-api/persistence/boardPersistence";
import { getMembershipRecordForEntity } from "@trz-api/persistence/membershipPersistence";
import { createProject, getProjectById, updateProject } from "@trz-api/persistence/projectPersistence";
import { getInvitesForEntity } from "./inviteController";
import { populateMemberships } from "./userController";
import { getMembersInOrg } from "./organizationController";

export async function getProjectPreview(projectId: ProjectId) {
    try {
        const projectHeader = await getProjectById(projectId);
        if(!projectHeader){
            throw new Error ("No project found with id "+projectId);
        }
        return projectHeader;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function getFullProject(projectId: ProjectId) {
    try {
        const projectHeader = await getProjectById(projectId);
        if(!projectHeader){
            throw new Error ("No project found with id "+projectId);
        }

        const project:Project = {
            ...projectHeader,
            boards :await getBoardsByProjectId(projectId) ?? [],
            externalMembers : await getMembersInProject(projectId) ?? [],
            orgMembers : await getMembersInOrg(projectHeader.orgId) ?? [],
            invites: await getInvitesForEntity(projectId) ?? [],
        };
        
        return project;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function addProject(name:string, orgId:OrganizationId) {
    if(name.length === 0 || name.length > 50) {
        throw new Error("Name must be 0 - 50 characters");
    }

    const newProject: ProjectHeader = {
        id: crypto.randomUUID(),
        orgId: orgId,
        name,
        archived:false,
        createdAt: Date.now(),
        logoUrl: "",
        description: "",
    };

    try{
        await createProject(newProject);
        return newProject.id;
    }catch (e) {
        throw new Error("Failed to create org" + e);
    }
}

export async function updateProjectFromPartial(projectId: ProjectId, partial:Partial<ProjectHeader>) {
    const updatingProject = await getProjectById(projectId);
    if (updatingProject == null) {
        throw new Error("Project not found");
    }

    const updated = updateBaseFromPartial<ProjectHeader>(updatingProject, partial);
    try {
        await updateProject(updated);
    } catch (e:any) {
        throw new Error("Failed to update project "+e);
    }
}

export const getMembersInProject = async (projectId: ProjectId) => {
    const project = await getProjectById(projectId);
    if (project == null) {
        throw new Error("Project not found");
    }
    const records = await getMembershipRecordForEntity(projectId);
    const members = populateMemberships(records);

    return members;
}