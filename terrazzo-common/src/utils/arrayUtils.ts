import { MembershipRecord } from '../types';

export function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = array.slice();
    arrayMoveInPlace(newArray, from, to);
    return newArray;
}

export function arrayMoveInPlace(array: any[], from: number, to: number): void {
    array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
}

export function updateBaseFromPartial<T>(base: T, partial: Partial<T>): T {
    if (typeof base !== 'object') {
        throw new Error('Expected base to be object, received ' + typeof base);
    }
    if (base === null || base === undefined) {
        throw new Error('Base cannot be null');
    }
    const mappedBase = { ...base };
    const keys = Object.keys(mappedBase);
    for (const k of keys) {
        const partialField = partial[k];
        if (partialField !== undefined) {
            mappedBase[k] = partialField;
        }
    }
    return mappedBase;
}

/**
 * If the userId and entityId are the same on 2 records, combine the 2 records and keep the max permission level
 */
export const combineMembershipRecords = (records: MembershipRecord[]): MembershipRecord[] => {
    const map: { [id: string]: MembershipRecord } = {};
    for (const rec of records) {
        const id = rec.entityId + ' ' + rec.userId;
        if (!map[id] || map[id].userRole < rec.userRole) {
            map[id] = rec;
        }
    }
    return Object.values(map);
};
