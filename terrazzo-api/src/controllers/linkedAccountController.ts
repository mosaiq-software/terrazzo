import { exhaustiveCheck, LinkedAccount, LinkedAccountProvider, UserId } from '@mosaiq/terrazzo-common';
import { syncUsersLinkedAccounts } from '@trz-api/broadcasters';
import {
    createLinkedAccountDb,
    deleteLinkedAccountDb,
    getLinkedAccountForProviderDb,
    getLinkedAccountsForUserDb,
    getPrivateLinkedAccountDb,
    updateLinkedAccountDb,
} from '@trz-api/persistence/linkedAccountPersistence';
import { revokeGithubAuth } from '@trz-api/utils/githubUtils';

export const getLinkedAccountsForUser = async (userId: UserId) => {
    const linkedAccounts = await getLinkedAccountsForUserDb(userId);
    return linkedAccounts;
};

export const addLinkedAccountToUser = async (linkedAccount: Required<LinkedAccount>) => {
    const existingAccount = await getLinkedAccountForProviderDb(linkedAccount.provider, linkedAccount.accountId);
    if (existingAccount) {
        if (existingAccount.userId !== linkedAccount.userId) {
            throw new Error(`Linked account already exists for a different user`);
        }
        return existingAccount;
    }
    createLinkedAccountDb(linkedAccount);
    await syncUsersLinkedAccounts(linkedAccount.userId);
    return linkedAccount;
};

export const updateLinkedAccountForUser = async (
    provider: LinkedAccountProvider,
    accountId: string,
    userId: UserId,
    updatedData: Partial<LinkedAccount>
) => {
    const existingAccount = await getLinkedAccountForProviderDb(provider, accountId);
    if (!existingAccount || existingAccount.userId !== userId) {
        throw new Error(`Linked account does not exist for this user`);
    }
    await updateLinkedAccountDb(provider, accountId, userId, updatedData);
    await syncUsersLinkedAccounts(userId);
};

export const removeLinkedAccountFromUser = async (
    userId: UserId,
    provider: LinkedAccountProvider,
    accountId: string
) => {
    const existingAccount = await getLinkedAccountForProviderDb(provider, accountId);
    if (!existingAccount || existingAccount.userId !== userId) {
        throw new Error(`Linked account does not exist for this user`);
    }

    const privateAccount = await getPrivateLinkedAccountDb(provider, accountId, userId);
    if (!privateAccount) {
        throw new Error(`Private linked account data not found`);
    }

    switch (privateAccount.provider) {
        case LinkedAccountProvider.Github:
            if (privateAccount.privateAccountData) {
                await revokeGithubAuth(privateAccount.privateAccountData.accessToken);
            }
            break;
        case LinkedAccountProvider.DEV:
            break;
        default:
            exhaustiveCheck(privateAccount);
    }

    await deleteLinkedAccountDb(provider, accountId, userId);
    await syncUsersLinkedAccounts(userId);
};
