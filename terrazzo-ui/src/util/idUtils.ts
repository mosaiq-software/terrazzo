import { UID } from '@mosaiq/terrazzo-common';

/**
 * Extracts a UUID from a given string. If the string is a valid UUID, it returns it directly.
 */
export const extractUUID = (input: string): UID => {
    if (isUUID(input)) {
        return input as UID;
    }
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = input.match(uuidRegex);
    if (match) {
        return match[0] as UID;
    }
    throw new Error('No valid UUID found in the input string.');
};

export const uuidToReadableUuid = (uuid: UID): string => {
    return uuid.replace(/-/g, ' ');
};

const isUUID = (input: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(input);
};
