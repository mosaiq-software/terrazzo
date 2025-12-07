import { ClientSE, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getOrgsForUser } from '@trz-api/controllers/membershipController';
import { addOrganization, getOrganizationPreview, updateOrganizationFromPartial } from '@trz-api/controllers/organizationController';
import { broadcast, getSocketData, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerOrganizationListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_ORGANIZATION, async (data) => {
        const orgHeader = await getOrganizationPreview(data);
        return orgHeader;
    });

    sub(socket, ClientSE.CREATE_ORG, async (data) => {
        const socketData = getSocketData(socket);
        const orgId = await addOrganization(data.name, socketData.user.user.id);
        return orgId;
    });

    sub(socket, ClientSE.UPDATE_ORG_FIELD, async (data) => {
        await updateOrganizationFromPartial(data.id, data);
        broadcast(socket, ServerSE.UPDATE_ORG_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
        return undefined;
    });

    sub(socket, ClientSE.GET_USERS_ORGANIZATIONS, async (data) => {
        const orgs = await getOrgsForUser(data);
        return orgs;
    });
};
