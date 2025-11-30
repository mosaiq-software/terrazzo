import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { OrganizationId, UserId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getUserHeader = async (sockCtx: SocketContextType, userId: UserId) => {
    return await sockCtx.emit(ClientSE.GET_USER, userId);
};

export const getUserDirectoryStructure = async (sockCtx: SocketContextType, userId: UserId, orgId: OrganizationId) => {
    return await sockCtx.emit(ClientSE.GET_USERS_DIRECTORY_STRUCTURE, { userId, orgId });
};
