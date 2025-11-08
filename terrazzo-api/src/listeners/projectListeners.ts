import { ClientSE, ClientSEPayload, ClientSEReply, ServerSE, RoomType } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { getFullProject, getProjectPreview, addProject, updateProjectFromPartial } from '@trz-api/controllers/projectController';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerProjectListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_PROJECT, async (data: ClientSEPayload[ClientSE.GET_PROJECT], reply: ClientSEReply<ClientSE.GET_PROJECT>) => {
        try {
            if (!data) {
                throw new Error('No project id provided');
            }
            const project = await getFullProject(data);
            reply(project);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.PREVIEW_PROJECT, async (data: ClientSEPayload[ClientSE.PREVIEW_PROJECT], reply: ClientSEReply<ClientSE.PREVIEW_PROJECT>) => {
        try {
            if (!data) {
                throw new Error('No project id provided');
            }
            const projectHeader = await getProjectPreview(data);
            reply(projectHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_PROJECT, async (data: ClientSEPayload[ClientSE.CREATE_PROJECT], reply: ClientSEReply<ClientSE.CREATE_PROJECT>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            const projectId = await addProject(data.name, data.orgId);
            reply(projectId);
        } catch (error: any) {
            console.error('Error creating card', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_PROJECT_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_PROJECT_FIELD], reply: ClientSEReply<ClientSE.UPDATE_PROJECT_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No project data provided');
            }
            await updateProjectFromPartial(data.id, data);
            broadcast<ServerSE.UPDATE_PROJECT_FIELD>(socket, ServerSE.UPDATE_PROJECT_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
        } catch (error: any) {
            console.error('Error updating project fields', error);
            reply(undefined, error.message);
        }
    });
};
