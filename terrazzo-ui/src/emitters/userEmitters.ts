import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { UserId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getUserHeader = async (sockCtx: SocketContextType, userId: UserId) => {
    return await sockCtx.emit<ClientSE.PREVIEW_USER>(ClientSE.PREVIEW_USER, userId);
};
