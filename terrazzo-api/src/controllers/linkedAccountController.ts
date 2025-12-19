import { LinkedAccount, LinkedAccountProvider, UserId } from '@mosaiq/terrazzo-common';
import { createLinkedAccountDb, deleteLinkedAccountDb, getLinkedAccountForProviderDb, getLinkedAccountsForUserDb } from '@trz-api/persistence/linkedAccountPersistence';

export const getLinkedAccountsForUser = async (userId: UserId) => {
    const linkedAccounts = await getLinkedAccountsForUserDb(userId);
    return linkedAccounts;
};

export const addLinkedAccountToUser = async (linkedAccount: LinkedAccount) => {
    const existingAccount = await getLinkedAccountForProviderDb(linkedAccount.provider, linkedAccount.accountId);
    if (existingAccount) {
        if (existingAccount.userId !== linkedAccount.userId) {
            throw new Error(`Linked account already exists for a different user`);
        }
        return existingAccount;
    }
    createLinkedAccountDb(linkedAccount);
    return linkedAccount;
};

export const removeLinkedAccountFromUser = async (userId: UserId, provider: LinkedAccountProvider, accountId: string) => {
    const existingAccount = await getLinkedAccountForProviderDb(provider, accountId);
    if (!existingAccount || existingAccount.userId !== userId) {
        throw new Error(`Linked account does not exist for this user`);
    }
    await deleteLinkedAccountDb(provider, accountId, userId);
};
