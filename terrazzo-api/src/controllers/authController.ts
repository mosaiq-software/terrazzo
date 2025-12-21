import { AuthProvider, AuthProviderCallbackData, AuthSession, breakNames, exhaustiveCheck, ExistingAuthToken, LinkedAccountProvider, UserId, UserIdWithAuth } from '@mosaiq/terrazzo-common';
import { createAuthSessionDb, deleteAuthSessionByUserIdDb, getAuthSessionByAuthTokenDb, getAuthSessionByUserIdDb } from '@trz-api/persistence/authSessionPersistence';
import { getLinkedAccountForProviderDb } from '@trz-api/persistence/linkedAccountPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import { generateAuthToken } from '@trz-api/utils/authUtils';
import { isDev } from '@trz-api/utils/envUtils';
import { getGithubAccessTokenFromCode, getPrivateGitHubUserData } from '@trz-api/utils/githubUtils';
import { addLinkedAccountToUser, updateLinkedAccountForUser } from './linkedAccountController';
import { createNewUser } from './userController';

const EXPIRE_AUTH_SESSIONS_AFTER_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/**
 * Starts a new authenticated session for the given user ID
 * If an existing valid session exists, it is returned instead
 * If an existing session is expired, it is refreshed
 * If no existing session, a new one is created
 */
export const startAuthenticatedSession = async (userId: UserId): Promise<AuthSession | undefined> => {
    // Can only start a session for an existing user
    const user = await getUserHeaderByIdDb(userId);
    if (!user) {
        return undefined;
    }

    const existingSession = await getAuthSessionByUserIdDb(userId);
    if (existingSession) {
        if (existingSession.userId !== userId) {
            throw new Error('Auth session user ID does not match requested user ID');
        }
        if (Date.now() - existingSession.createdAt < EXPIRE_AUTH_SESSIONS_AFTER_MS) {
            return existingSession;
        }
        await deleteAuthSessionByUserIdDb(userId);
    }

    const token = generateAuthToken();
    const newAuthSession = await createAuthSessionDb(userId, token);
    return newAuthSession;
};

/**
 * Ends the authenticated session for the given user ID
 */
export const endAuthenticatedSession = async (userId: UserId): Promise<void> => {
    await deleteAuthSessionByUserIdDb(userId);
};

/**
 * Checks existing auth token and returns valid auth session if found
 * If the valid session is expired, it is refreshed
 * If no valid session is found, a fresh session will NOT be created
 */
export const signInWithExistingAuth = async (existingAuth: ExistingAuthToken): Promise<AuthSession | undefined> => {
    const authSession = await getAuthSessionByAuthTokenDb(existingAuth.trzAuthToken);
    if (!authSession) {
        return undefined;
    }

    // Ensure the auth session belongs to the user
    if (authSession.userId !== existingAuth.userId) {
        throw new Error('Invalid existing auth token for user');
    }

    // Check if the session is still valid
    if (Date.now() - authSession.createdAt < EXPIRE_AUTH_SESSIONS_AFTER_MS) {
        return authSession;
    }

    await deleteAuthSessionByUserIdDb(authSession.userId);

    const token = generateAuthToken();
    const newAuthSession = await createAuthSessionDb(existingAuth.userId, token);
    return newAuthSession;
};

/**
 * Handles the auth provider callback and returns an auth session
 * Delegates to specific provider handlers based on the provider type
 */
export const handleAuthProviderCallback = async (providerData: AuthProviderCallbackData): Promise<AuthSession | undefined | 'already-linked'> => {
    switch (providerData.provider) {
        case AuthProvider.Github:
            return handleGithubAuth(providerData.code, providerData.accessToken, providerData.auth);
        case AuthProvider.DEV:
            return handleDevAuth(providerData.username, providerData.auth);
        default:
            return exhaustiveCheck(providerData, `Unsupported auth provider: ${providerData}`);
    }
};

/**
 * Handles DEV auth provider callback
 * This is for development only and allows sign-in with just a username
 * @param username The dev username
 * @param auth Optional existing user auth to link the DEV account to
 */
const handleDevAuth = async (username: string, auth?: UserIdWithAuth): Promise<AuthSession | undefined | 'already-linked'> => {
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
                privateAccountData: {},
            });
        } else {
            throw new Error(`DEV users must have a linked account to sign in. No linked account found for username: ${username}`);
        }
    }

    if (auth && linkedAccount.userId !== auth.userId) {
        return 'already-linked';
    }

    const authSession = await startAuthenticatedSession(linkedAccount.userId);
    return authSession;
};

/**
 * Handles GitHub auth provider callback
 * Must provide either a code or access token to proceed
 * @param code the OAuth code from GitHub
 * @param accessToken the GitHub access token
 * @param auth Optional existing user auth to link the GitHub account to
 */
const handleGithubAuth = async (code: string | undefined, accessToken: string | undefined, auth?: UserIdWithAuth): Promise<AuthSession | undefined | 'already-linked'> => {
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
        // Create new linked account
        let userId = auth?.userId;
        if (!userId) {
            // Create new user if no existing auth provided
            const { firstName, lastName } = breakNames(githubData.name);
            const newUser = await createNewUser(githubData.login, firstName, lastName, githubData.avatar_url);
            userId = newUser.id;
        }

        linkedAccount = await addLinkedAccountToUser({
            provider: LinkedAccountProvider.Github,
            accountId: githubData.id.toString(),
            userId: userId,
            accountData: githubData,
            privateAccountData: { accessToken: githubAuthToken },
        });
    } else if (auth && linkedAccount.userId !== auth.userId) {
        // The GitHub account is already linked to a different user
        return 'already-linked';
    } else {
        // Update the private account data with the latest access token
        await updateLinkedAccountForUser(LinkedAccountProvider.Github, linkedAccount.accountId, linkedAccount.userId, {
            privateAccountData: { accessToken: githubAuthToken },
        });
    }

    const authSession = await startAuthenticatedSession(linkedAccount.userId);
    return authSession;
};
