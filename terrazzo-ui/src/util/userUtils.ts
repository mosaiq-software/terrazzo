import { callTrzApi } from '@trz/util/apiUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { RestRoutes } from '@mosaiq/terrazzo-common/apiTypes';
import { UserId } from '@mosaiq/terrazzo-common/types';

export const checkUsernameTaken = async (username: string) => {
    try {
        if (!username) {
            return undefined;
        }
        const taken = await callTrzApi<RestRoutes.USER_CHECK_USERNAME>(RestRoutes.USER_CHECK_USERNAME, { username }, undefined);
        return taken;
    } catch (error) {
        notify(NoteType.GENERIC_ERROR, 'Error checking username ' + error);
        return undefined;
    }
};

export const setUpUserData = async (userId: UserId, username: string, firstName: string, lastName: string) => {
    try {
        if (!username) {
            return undefined;
        }
        const taken = await callTrzApi<RestRoutes.USER_SETUP>(RestRoutes.USER_SETUP, { id: userId }, { username, firstName, lastName });
        return taken;
    } catch (error) {
        notify(NoteType.GENERIC_ERROR, 'Error checking username ' + error);
        return undefined;
    }
};
