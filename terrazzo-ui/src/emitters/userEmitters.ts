import { ClientSE, UserHeader, UserId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getUserHeader = async (sockCtx: SocketContextType, userId: UserId) => {
    return await sockCtx.emit(ClientSE.GET_USER, userId);
};

export const updateUserField = async (sockCtx: SocketContextType, userData: Partial<UserHeader> & { id: UserId }) => {
    return await sockCtx.emit(ClientSE.UPDATE_USER_FIELD, userData);
};

export const logoutUser = async (sockCtx: SocketContextType) => {
    return await sockCtx.emit(ClientSE.LOGOUT, undefined);
};

export const getUsernameAvailable = async (sockCtx: SocketContextType, username: string) => {
    return await sockCtx.emit(ClientSE.GET_USERNAME_AVAILABLE, username);
};
