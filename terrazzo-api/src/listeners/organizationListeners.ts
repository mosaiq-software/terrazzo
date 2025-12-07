import { ClientSE, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getOrgsForUser } from '@trz-api/controllers/membershipController';
import { addOrganization, getOrganizationPreview, updateOrganizationFromPartial } from '@trz-api/controllers/organizationController';
import { userCanAdministerOrganization, userCanGetPersonalDataForUser, userCanViewOrganization } from '@trz-api/utils/permissions';
import { broadcast, getSocketData, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerOrganizationListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_ORGANIZATION, async (data) => {
        if (!(await userCanViewOrganization(socket, data))) {
            throw new Error(`User does not have permission to view the organization`);
        }
        const orgHeader = await getOrganizationPreview(data);
        return orgHeader;
    });

    sub(socket, ClientSE.CREATE_ORG, async (data) => {
        const socketData = getSocketData(socket);
        const orgId = await addOrganization(data.name, socketData.user.user.id);
        return orgId;
    });

    sub(socket, ClientSE.UPDATE_ORG_FIELD, async (data) => {
        if (!(await userCanAdministerOrganization(socket, data.id))) {
            throw new Error(`User does not have permission to edit this organization`);
        }
        await updateOrganizationFromPartial(data.id, data);
        broadcast(socket, ServerSE.UPDATE_ORG_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
        return undefined;
    });

    sub(socket, ClientSE.GET_USERS_ORGANIZATIONS, async (data) => {
        if (!(await userCanGetPersonalDataForUser(socket, data))) {
            throw new Error(`User does not have permission to get personal data for this user`);
        }
        const orgs = await getOrgsForUser(data);
        return orgs;
    });
};
