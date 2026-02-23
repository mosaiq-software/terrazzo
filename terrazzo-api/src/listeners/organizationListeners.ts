import { ClientSE } from '@mosaiq/terrazzo-common';
import {
    addOrganization,
    getOrganizationPreview,
    updateOrganizationFromPartial,
} from '@trz-api/controllers/organizationController';
import { userCanAdministerOrganization } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerOrganizationListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_ORGANIZATION, async (data) => {
        const orgHeader = await getOrganizationPreview(data);
        return orgHeader;
    });

    subscribe(socket, ClientSE.CREATE_ORG, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error(`User does not have permission to create an organization`);
        }
        const orgId = await addOrganization({ name: data.name, ownerId: socketData.user.userId });
        return orgId;
    });

    subscribe(socket, ClientSE.UPDATE_ORG_FIELD, async (data) => {
        if (!(await userCanAdministerOrganization(socket, data.id))) {
            throw new Error(`User does not have permission to edit this organization`);
        }
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        await updateOrganizationFromPartial(data.id, data, socketData.user.userId);
        return undefined;
    });
};
