import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncUpdateUserField } from '@trz-api/broadcasters';
import { endAuthenticatedSession } from '@trz-api/controllers/authController';
import { getOrgsForUser } from '@trz-api/controllers/membershipController';
import { getUserPreview, updateUserData } from '@trz-api/controllers/userController';
import { userCanGetAndEditPersonalDataForUser } from '@trz-api/utils/permissions';
import { getSocketData, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerUserListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_USER, async (data) => {
        const userHeader = await getUserPreview(data);
        return userHeader;
    });

    subscribe(socket, ClientSE.UPDATE_USER_FIELD, async (data) => {
        if (!(await userCanGetAndEditPersonalDataForUser(socket, data.id))) {
            throw new Error(`User does not have permission to edit personal data for this user`);
        }
        await updateUserData(data);
        await syncUpdateUserField(io, data.id, data);
        return undefined;
    });

    subscribe(socket, ClientSE.GET_USERS_ORGANIZATIONS, async (data) => {
        if (!(await userCanGetAndEditPersonalDataForUser(socket, data))) {
            throw new Error(`User does not have permission to get personal data for this user`);
        }
        const orgs = await getOrgsForUser(data);
        return orgs;
    });

    subscribe(socket, ClientSE.LOGOUT, async () => {
        const socketData = getSocketData(socket);
        if (!socketData.user?.userId) {
            return undefined;
        }
        await endAuthenticatedSession(socketData.user.userId);
        return undefined;
    });
};
