import { OrganizationId, Project, ProjectId,} from "@mosaiq/terrazzo-common/types";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { createProject, getProjectById, updateProject } from "@trz-api/persistence/projectPersistence";

export async function addProject(name:string, orgId:OrganizationId) {
    if(name.length === 0 || name.length > 50) {
        throw new Error("Name must be 0 - 50 characters");
    }

    const newProject: Project = {
        id: crypto.randomUUID(),
        orgId: orgId,
        name,
        archived:false,
        createdAt: Date.now(),
        logoUrl: "",
        boards: [],
    };

    try{
        await createProject(newProject);
        return newProject.id;
    }catch (e) {
        throw new Error("Failed to create org" + e);
    }
}

export async function updateProjectFromPartial(projectId: ProjectId, partial:Partial<Project>) {
    const updatingProject = await getProjectById(projectId);
    if (updatingProject == null) {
        throw new Error("Project not found");
    }

    const updated = updateBaseFromPartial<Project>(updatingProject, partial);
    try {
        await updateProject(updated);
    } catch (e:any) {
        throw new Error("Failed to update project "+e);
    }
}