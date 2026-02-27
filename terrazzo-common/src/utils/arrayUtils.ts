export function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = array.slice();
    arrayMoveInPlace(newArray, from, to);
    return newArray;
}

export function arrayMoveInPlace(array: any[], from: number, to: number): void {
    array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
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

export const withIf = <T>(item: T | T[], condition: any): T[] => {
    return condition ? (Array.isArray(item) ? item : [item]) : [];
};

export const exhaustiveCheck = (param: never, message?: string): never => {
    throw new Error(message || `Exhaustive check failed for value: ${param}`);
};

export const settlePromises = async <T>(promises: Promise<T>[]): Promise<{ fulfilled: T[]; rejected: any[] }> => {
    const results = await Promise.allSettled(promises);
    const fulfilled: T[] = [];
    const rejected: any[] = [];
    for (const result of results) {
        if (result.status === 'fulfilled') {
            fulfilled.push(result.value);
        } else {
            rejected.push(result.reason);
        }
    }
    return { fulfilled, rejected };
};
