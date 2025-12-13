import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncUpdateOrgField } from '@trz-api/broadcasters';
import { getOrgsForUser } from '@trz-api/controllers/membershipController';
import { addOrganization, getOrganizationPreview, updateOrganizationFromPartial } from '@trz-api/controllers/organizationController';
import { userCanAdministerOrganization, userCanGetPersonalDataForUser } from '@trz-api/utils/permissions';
import { getSocketData, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerOrganizationListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_ORGANIZATION, async (data) => {
        const orgHeader = await getOrganizationPreview(data);
        return orgHeader;
    });

    subscribe(socket, ClientSE.CREATE_ORG, async (data) => {
        const socketData = getSocketData(socket);
        const orgId = await addOrganization(data.name, socketData.user.user.id);
        return orgId;
    });

    subscribe(socket, ClientSE.UPDATE_ORG_FIELD, async (data) => {
        if (!(await userCanAdministerOrganization(socket, data.id))) {
            throw new Error(`User does not have permission to edit this organization`);
        }
        await updateOrganizationFromPartial(data.id, data);
        await syncUpdateOrgField(io, data.id, data);
        return undefined;
    });

    subscribe(socket, ClientSE.GET_USERS_ORGANIZATIONS, async (data) => {
        if (!(await userCanGetPersonalDataForUser(socket, data))) {
            throw new Error(`User does not have permission to get personal data for this user`);
        }
        const orgs = await getOrgsForUser(data);
        return orgs;
    });
};
