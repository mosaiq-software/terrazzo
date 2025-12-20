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
