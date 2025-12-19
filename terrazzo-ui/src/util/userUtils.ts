import { RestRoutes } from '@mosaiq/terrazzo-common';
import { callTrzApi } from '@trz/util/apiUtils';
import { NoteType, notify } from '@trz/util/notifications';

export const checkUsernameTaken = async (username: string) => {
    try {
        if (!username) {
            return undefined;
        }
        const taken = await callTrzApi(RestRoutes.USER_CHECK_USERNAME, { username }, undefined);
        return taken;
    } catch (error) {
        notify(NoteType.GENERIC_ERROR, 'Error checking username ' + error);
        return undefined;
    }
};
