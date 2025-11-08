import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { UserId, UserDash } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';
import { notify, NoteType } from '@trz/util/notifications';

export const getUsersDash = async (sockCtx: SocketContextType, userId: UserId): Promise<UserDash | undefined> => {
    try {
        const response = await sockCtx.emit<ClientSE.GET_USER_DASH>(ClientSE.GET_USER_DASH, userId);
        if (!response) throw new Error('No data found for user ' + userId);
        return response;
    } catch (e: any) {
        notify(NoteType.DASH_ERROR, e);
        return undefined;
    }
};

export const getUserHeader = async (sockCtx: SocketContextType, userId: UserId) => {
    return await sockCtx.emit<ClientSE.PREVIEW_USER>(ClientSE.PREVIEW_USER, userId);
};
