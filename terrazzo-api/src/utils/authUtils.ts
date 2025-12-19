import { AuthProviderToken, AuthSession } from '@mosaiq/terrazzo-common';

/**
 * Generates a random authentication token.
 * Auth tokens are 8 x 32 character UUIDs concatenated together (without dashes) to form a single 256 character string.
 */
export const generateAuthToken = (): string => {
    return [...Array(8)]
        .map(() => crypto.randomUUID())
        .join('')
        .replace(/-/g, '');
};

export const getFrontendAuthSessionCallbackUrl = (session: AuthSession, auth: AuthProviderToken) => {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
        throw new Error('Missing FRONTEND_URL environment variable');
    }
    // /auth/:userId/:provider/:providerAuthToken/:trzAuthToken
    return `${frontendUrl}/auth/${session.userId}/${auth.provider}/${auth.providerAuthToken}/${session.authToken}`;
};
