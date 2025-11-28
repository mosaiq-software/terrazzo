import { UID } from '@mosaiq/terrazzo-common/types';

export const anythingToUUID = (input: string): UID => {
    if (isUUID(input)) {
        return input as UID;
    }
    const dashed = input.replace(/[\s._]/g, '-');
    if (isUUID(dashed)) {
        return dashed as UID;
    }
    throw new Error(`Input string "${input}" cannot be converted to a valid UUID`);
};

export const uuidToReadableUuid = (uuid: UID): string => {
    return uuid.replace(/-/g, ' ');
};

const isUUID = (input: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(input);
};
