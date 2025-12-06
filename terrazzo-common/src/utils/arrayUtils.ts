export function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = array.slice();
    arrayMoveInPlace(newArray, from, to);
    return newArray;
}

export function arrayMoveInPlace(array: any[], from: number, to: number): void {
    array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
}

export function updateBaseFromPartial<T extends Record<string, any>>(base: T, partial: Partial<T>): T {
    if (typeof base !== 'object') {
        throw new Error('Expected base to be object, received ' + typeof base);
    }
    if (base === null || base === undefined) {
        throw new Error('Base cannot be null');
    }
    const mappedBase = { ...base };
    const keys = Object.keys(partial) as Array<keyof T>;
    for (const k of keys) {
        const partialField = partial[k];
        if (partialField !== undefined) {
            mappedBase[k] = partialField as T[keyof T];
        }
    }
    return mappedBase;
}

export const recordKeys = <T extends string | number | symbol, V>(record: Record<T, V>): T[] => {
    return Object.keys(record) as T[];
};
export const recordValues = <K extends string | number | symbol, V>(record: Record<K, V>): V[] => {
    return Object.values(record) as V[];
};
export const recordEntries = <K extends string | number | symbol, V>(record: Record<K, V>): [K, V][] => {
    return Object.entries(record) as [K, V][];
};
