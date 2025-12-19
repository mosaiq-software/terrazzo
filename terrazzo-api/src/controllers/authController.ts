import { AuthProvider, AuthProviderToken, AuthSession, exhaustiveCheck, LinkedAccountProvider, UserId } from '@mosaiq/terrazzo-common';
import { createAuthSessionDb, deleteAuthSessionByUserIdDb, getAuthSessionByAuthTokenDb } from '@trz-api/persistence/authSessionPersistence';
import { getLinkedAccountForProviderDb } from '@trz-api/persistence/linkedAccountPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import { generateAuthToken } from '@trz-api/utils/authUtils';
import { isDev } from '@trz-api/utils/envUtils';
import { getPrivateGitHubUserData } from '@trz-api/utils/githubUtils';
import { DEV_upsertFakeUser } from './userController';

export const startAuthenticatedSession = async (userId: UserId): Promise<AuthSession | undefined> => {
    // Can only start a session for an existing user
    const user = await getUserHeaderByIdDb(userId);
    if (!user) {
        return undefined;
    }

    const token = generateAuthToken();
    const newAuthSession = await createAuthSessionDb(userId, token);
    return newAuthSession;
};

export const getExistingAuthenticatedSession = async (userId: UserId): Promise<AuthSession | undefined> => {
    const authSession = await getAuthSessionByAuthTokenDb(userId);
    return authSession || undefined;
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
    const user = await DEV_upsertFakeUser(devUsername);
    const authSession = await startAuthenticatedSession(user.id);
    return authSession;
};

export const signInWithGithub = async (githubAccessToken: string): Promise<AuthSession | undefined> => {
    try {
        const githubData = await getPrivateGitHubUserData(githubAccessToken);
        if (!githubData || !githubData.id) {
            console.warn(`Failed to get valid GitHub data for access token: ${githubAccessToken}`);
            return undefined;
        }
        const linkedAccount = await getLinkedAccountForProviderDb(LinkedAccountProvider.Github, githubData.id.toString());
        if (!linkedAccount) {
            console.warn(`No linked account found for GitHub user ID: ${githubData.id}`);
            return undefined;
        }
        const authSession = await startAuthenticatedSession(linkedAccount.userId);
        return authSession;
    } catch (error) {
        console.error('Error during GitHub sign-in:', error);
        return undefined;
    }
};
