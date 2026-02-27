import { CompoundUID, UID } from '../types/genericTypes';

export const isUuid = (str: string): str is UID => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

export const parseCompoundKey = (key: CompoundUID): { a: UID; b: UID } => {
    const [a, b] = key.split('.');
    if (!a || !b || !isUuid(a) || !isUuid(b)) {
        throw new Error(`Invalid compound key format: ${key}. Expected format: a.b`);
    }
    return { a, b };
};

export const createCompoundKey = (a: UID, b: UID): CompoundUID => {
    return `${a}.${b}`;
};
