import { UID } from './types/genericTypes';

export enum LocalStorageKey {
    SIDEBAR_COLLAPSED = 'SIDEBAR_COLLAPSED',
    LAST_SELECTED_ORG = 'LAST_SELECTED_ORG',
}

export const TEMPORARY_ID: UID = 'THIS-IS-A-TEMPORARY-ID';
export const SYSTEM_USER_ID: UID = 'system-system-system-system-system';

export const BLOCKNOTE_FRAGMENT_ID = 'document-store';

export enum Priority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
}

export enum StoryPoints {
    ZERO = 0,
    XXS = 1,
    XS = 2,
    S = 3,
    M = 5,
    L = 8,
    XL = 13,
    XXL = 21,
}
