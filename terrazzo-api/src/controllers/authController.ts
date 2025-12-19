import { AuthProvider, AuthProviderToken, AuthSession, exhaustiveCheck, LinkedAccountProvider, UserId } from '@mosaiq/terrazzo-common';
import { createAuthSessionDb, deleteAuthSessionByUserIdDb, getAuthSessionByAuthTokenDb, getAuthSessionByUserIdDb } from '@trz-api/persistence/authSessionPersistence';
import { createLinkedAccountDb, getLinkedAccountForProviderDb } from '@trz-api/persistence/linkedAccountPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import { generateAuthToken } from '@trz-api/utils/authUtils';
import { isDev } from '@trz-api/utils/envUtils';
import { getPrivateGitHubUserData } from '@trz-api/utils/githubUtils';
import { createNewUser } from './userController';

const EXPIRE_AUTH_SESSIONS_AFTER_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export const startAuthenticatedSession = async (userId: UserId): Promise<AuthSession | undefined> => {
    // Can only start a session for an existing user
    const user = await getUserHeaderByIdDb(userId);
    if (!user) {
        return undefined;
    }

    const existingSession = await getAuthSessionByUserIdDb(userId);
    if (existingSession) {
        if (Date.now() - existingSession.createdAt < EXPIRE_AUTH_SESSIONS_AFTER_MS) {
            return existingSession;
        }
        await deleteAuthSessionByUserIdDb(userId);
    }

    const token = generateAuthToken();
    const newAuthSession = await createAuthSessionDb(userId, token);
    return newAuthSession;
};

export const getExistingAuthenticatedSession = async (authToken: string): Promise<AuthSession | undefined> => {
    const authSession = await getAuthSessionByAuthTokenDb(authToken);
    return authSession;
};

export const isAuthenticated = async (userId: UserId, authToken: string): Promise<boolean> => {
    const authSession = await getAuthSessionByAuthTokenDb(authToken);
    return authSession?.userId === userId;
};

export const endAuthenticatedSession = async (userId: UserId): Promise<void> => {
    await deleteAuthSessionByUserIdDb(userId);
};

export const signInWithExistingProvider = async (auth: AuthProviderToken): Promise<AuthSession | undefined> => {
    switch (auth.provider) {
        case AuthProvider.Github:
            return await signInWithGithub(auth.providerAuthToken);
        case AuthProvider.DEV:
            return await DEV_signInWithDev(auth.providerAuthToken);
        default:
            return exhaustiveCheck(auth.provider, `Unsupported auth provider: ${auth.provider}`);
    }
};

export const DEV_signInWithDev = async (devUsername: string): Promise<AuthSession | undefined> => {
    if (!isDev()) {
        console.warn('Attempted to sign in with DEV provider in non-dev environment');
        return undefined;
    }
    const linkedAccount = await getLinkedAccountForProviderDb(LinkedAccountProvider.DEV, devUsername);
    if (!linkedAccount) {
        throw new Error(`DEV users must have a linked account to sign in. No linked account found for username: ${devUsername}`);
    }
    const authSession = await startAuthenticatedSession(linkedAccount.userId);
    return authSession;
};

export const signInWithGithub = async (githubAccessToken: string): Promise<AuthSession | undefined> => {
    try {
        const githubData = await getPrivateGitHubUserData(githubAccessToken);
        if (!githubData || !githubData.id) {
            console.warn(`Failed to get valid GitHub data for access token: ${githubAccessToken}`);
            return undefined;
        }
        let linkedAccount = await getLinkedAccountForProviderDb(LinkedAccountProvider.Github, githubData.id.toString());
        if (!linkedAccount) {
            const [firstName, ...lastNameParts] = (githubData.name || githubData.login).split(' ');
            const lastName = lastNameParts.join(' ');
            const newUser = await createNewUser(githubData.login, firstName, lastName, githubData.avatar_url);
            linkedAccount = await createLinkedAccountDb({
                provider: LinkedAccountProvider.Github,
                accountId: githubData.id.toString(),
                userId: newUser.id,
                accountData: githubData,
            });
        }
        const authSession = await startAuthenticatedSession(linkedAccount.userId);
        return authSession;
    } catch (error) {
        console.error('Error during GitHub sign-in:', error);
        return undefined;
    }
};
