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

export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
export const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'];
export const AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
export const FILE_MIME_TYPES = ['application/pdf'];
export const SUPPORTED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES, ...AUDIO_MIME_TYPES, ...FILE_MIME_TYPES];

/**
 * Max characters allowed in names (e.g., board name, organization name, etc.)
 */
export const MAX_NAME_LENGTH = 1000;
