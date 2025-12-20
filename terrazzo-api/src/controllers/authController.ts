import { AuthProvider, AuthProviderCallbackData, AuthProviderToken, AuthSession, breakNames, exhaustiveCheck, LinkedAccountProvider, UserId, UserIdWithAuth } from '@mosaiq/terrazzo-common';
import { createAuthSessionDb, deleteAuthSessionByUserIdDb, getAuthSessionByAuthTokenDb, getAuthSessionByUserIdDb } from '@trz-api/persistence/authSessionPersistence';
import { getLinkedAccountForProviderDb } from '@trz-api/persistence/linkedAccountPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import { generateAuthToken } from '@trz-api/utils/authUtils';
import { isDev } from '@trz-api/utils/envUtils';
import { getGithubAccessTokenFromCode, getPrivateGitHubUserData } from '@trz-api/utils/githubUtils';
import { addLinkedAccountToUser } from './linkedAccountController';
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
            return await handleGithubAuth(undefined, auth.providerAuthToken, undefined);
        case AuthProvider.DEV:
            return await handleDevAuth(auth.providerAuthToken, undefined);
        default:
            return exhaustiveCheck(auth.provider, `Unsupported auth provider: ${auth.provider}`);
    }
};

export const handleAuthProviderCallback = async (providerData: AuthProviderCallbackData): Promise<AuthSession | undefined> => {
    switch (providerData.provider) {
        case AuthProvider.Github:
            return handleGithubAuth(providerData.code, providerData.accessToken, providerData.auth);
        case AuthProvider.DEV:
            return handleDevAuth(providerData.username, providerData.auth);
        default:
            return exhaustiveCheck(providerData, `Unsupported auth provider: ${providerData}`);
    }
};

const handleDevAuth = async (username: string, auth?: UserIdWithAuth): Promise<AuthSession | undefined> => {
    if (!isDev()) {
        console.warn('Attempted to handle DEV auth callback in non-dev environment');
        return undefined;
    }

    let linkedAccount = await getLinkedAccountForProviderDb(LinkedAccountProvider.DEV, username);
    if (!linkedAccount) {
        if (auth) {
            // Link new DEV account to existing user
            linkedAccount = await addLinkedAccountToUser({
                provider: LinkedAccountProvider.DEV,
                accountId: username,
                userId: auth.userId,
                accountData: {},
            });
        } else {
            throw new Error(`DEV users must have a linked account to sign in. No linked account found for username: ${username}`);
        }
    }

    const authSession = await startAuthenticatedSession(linkedAccount.userId);
    return authSession;
};

const handleGithubAuth = async (code: string | undefined, accessToken: string | undefined, auth?: UserIdWithAuth): Promise<AuthSession | undefined> => {
    let githubAuthToken = accessToken;
    if (!githubAuthToken) {
        if (!code) {
            throw new Error('No code or access token provided for GitHub auth callback');
        }
        githubAuthToken = await getGithubAccessTokenFromCode(code);
        if (!githubAuthToken) {
            throw new Error('Failed to get GitHub access token from code');
        }
    }

    const githubData = await getPrivateGitHubUserData(githubAuthToken);
    if (!githubData || !githubData.id) {
        throw new Error('Failed to get GitHub user data with provided access token');
    }

    let linkedAccount = await getLinkedAccountForProviderDb(LinkedAccountProvider.Github, githubData.id.toString());
    // If the account is linked, just sign in the user
    // If not, link it to the existing user (if provided) or create a new user
    if (!linkedAccount) {
        let userId = auth?.userId;
        if (!userId) {
            const { firstName, lastName } = breakNames(githubData.name);
            const newUser = await createNewUser(githubData.login, firstName, lastName, githubData.avatar_url);
            userId = newUser.id;
        }

        linkedAccount = await addLinkedAccountToUser({
            provider: LinkedAccountProvider.Github,
            accountId: githubData.id.toString(),
            userId: userId,
            accountData: githubData,
        });
    }
    const authSession = await startAuthenticatedSession(linkedAccount.userId);
    return authSession;
};
