import { ClientSE } from '@mosaiq/terrazzo-common';
import { addLinkedAccountToUser, getLinkedAccountsForUser, removeLinkedAccountFromUser } from '@trz-api/controllers/linkedAccountController';
import { userCanGetAndEditPersonalDataForUser } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerLinkedAccountListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_USERS_LINKED_ACCOUNTS, async (data) => {
        // This is public info so no permission check needed
        return getLinkedAccountsForUser(data);
    });

    subscribe(socket, ClientSE.CREATE_USER_LINKED_ACCOUNT, async (data) => {
        if (!(await userCanGetAndEditPersonalDataForUser(socket, data.userId))) {
            throw new Error(`User does not have permission to edit personal data for this user`);
        }
        await addLinkedAccountToUser(data);
        return undefined;
    });

    subscribe(socket, ClientSE.DELETE_USER_LINKED_ACCOUNT, async (data) => {
        if (!(await userCanGetAndEditPersonalDataForUser(socket, data.userId))) {
            throw new Error(`User does not have permission to edit personal data for this user`);
        }
        await removeLinkedAccountFromUser(data.userId, data.provider, data.accountId);
        return undefined;
    });
};
