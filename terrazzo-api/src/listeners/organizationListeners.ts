import { ClientSE, ClientSEPayload, ClientSEReply, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getOrgsForUser } from '@trz-api/controllers/membershipController';
import { addOrganization, getOrganizationPreview, updateOrganizationFromPartial } from '@trz-api/controllers/organizationController';
import { broadcast, getSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerOrganizationListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_ORGANIZATION, async (data: ClientSEPayload[ClientSE.GET_ORGANIZATION], reply: ClientSEReply<ClientSE.GET_ORGANIZATION>) => {
        try {
            if (!data) {
                throw new Error('No org id provided');
            }
            const orgHeader = await getOrganizationPreview(data);
            reply(orgHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_ORG, async (data: ClientSEPayload[ClientSE.CREATE_ORG], reply: ClientSEReply<ClientSE.CREATE_ORG>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            const socketData = getSocketData(socket);
            const orgId = await addOrganization(data.name, socketData.user.user.id);
            reply(orgId);
        } catch (error: any) {
            console.error('Error creating card', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_ORG_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_ORG_FIELD], reply: ClientSEReply<ClientSE.UPDATE_ORG_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No org data provided');
            }
            await updateOrganizationFromPartial(data.id, data);
            broadcast(socket, ServerSE.UPDATE_ORG_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
            reply(undefined);
        } catch (error: any) {
            console.error('Error updating org fields', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_USERS_ORGANIZATIONS, async (data: ClientSEPayload[ClientSE.GET_USERS_ORGANIZATIONS], reply: ClientSEReply<ClientSE.GET_USERS_ORGANIZATIONS>) => {
        try {
            if (!data) {
                throw new Error('No user id provided');
            }
            const orgs = await getOrgsForUser(data);
            reply(orgs);
        } catch (error: any) {
            reply([], error.message);
        }
    });
};
