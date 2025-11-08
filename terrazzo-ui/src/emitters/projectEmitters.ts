import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { OrganizationId, Project, ProjectHeader, ProjectId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';
import { NoteType, notify } from '@trz/util/notifications';

export const getProjectData = async (sockCtx: SocketContextType, projectId: ProjectId): Promise<Project | undefined> => {
    try {
        const project = await sockCtx.emit(ClientSE.GET_PROJECT, projectId);
        return project;
    } catch (e: any) {
        notify(NoteType.PROJECT_DATA_ERROR, e);
        return undefined;
    }
};

export const createProject = async (sockCtx: SocketContextType, name: string, orgId: OrganizationId): Promise<ProjectId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_PROJECT, { name, orgId });
};

export const updateProjectField = async (sockCtx: SocketContextType, id: ProjectId, partial: Partial<ProjectHeader>) => {
    await sockCtx.emit(ClientSE.UPDATE_PROJECT_FIELD, { ...partial, id });
};
