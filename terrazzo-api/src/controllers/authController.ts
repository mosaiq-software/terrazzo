import { AuthSession, UserId } from '@mosaiq/terrazzo-common';
import { createAuthSessionDb, deleteAuthSessionByUserIdDb, getAuthSessionByAuthTokenDb } from '@trz-api/persistence/authSessionPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';

export const startAuthenticatedSession = async (userId: UserId, authToken: string): Promise<AuthSession | undefined> => {
    // Can only start a session for an existing user
    const user = await getUserHeaderByIdDb(userId);
    if (!user) {
        return undefined;
    }

    // Try to find an existing auth session for the user ID and auth token
    const existingAuthSession = await getAuthSessionByAuthTokenDb(authToken);
    if (existingAuthSession && existingAuthSession.userId === userId) {
        return existingAuthSession;
    }

    const token = generateAuthToken();
    const newAuthSession = await createAuthSessionDb(userId, token);
    return newAuthSession;
};

export const isAuthenticated = async (userId: UserId, authToken: string): Promise<boolean> => {
    const authSession = await getAuthSessionByAuthTokenDb(authToken);
    return authSession != null && authSession.userId === userId;
};

export const endAuthenticatedSession = async (userId: UserId): Promise<void> => {
    await deleteAuthSessionByUserIdDb(userId);
};

/**
 * Generates a random authentication token.
 * Auth tokens are 8 x 32 character UUIDs concatenated together (without dashes) to form a single 256 character string.
 */
const generateAuthToken = (): string => {
    return [...Array(8)]
        .map(() => crypto.randomUUID())
        .join('')
        .replace(/-/g, '');
};
