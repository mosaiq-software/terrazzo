import { ClientSE, LinkedAccount, UserId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getLinkedAccountsForUser = async (sockCtx: SocketContextType, userId: UserId) => {
    return await sockCtx.emit(ClientSE.GET_USERS_LINKED_ACCOUNTS, userId);
};

export const linkAccountToUser = async (sockCtx: SocketContextType, linkedAccount: LinkedAccount) => {
    return await sockCtx.emit(ClientSE.CREATE_USER_LINKED_ACCOUNT, linkedAccount);
};

export const unlinkAccountFromUser = async (sockCtx: SocketContextType, linkedAccount: LinkedAccount) => {
    const { accountData, ...linkedAccountWithoutData } = linkedAccount;
    return await sockCtx.emit(ClientSE.DELETE_USER_LINKED_ACCOUNT, linkedAccountWithoutData);
};
