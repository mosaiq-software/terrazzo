import { CardId, ListId, Position, UID } from '../genericTypes';

export enum RoomType {
    /** Capture case. Do not use! */
    INVALID_DO_NOT_USE = 'INVALID',
    /** For showing others' mouse cursors / dragging */
    MOUSE = 'MOUSE',
    /** For sending updates to a specific UserId's socket */
    USER = 'USER',
    /** For updating arbitrary fields realtime */
    DATA = 'DATA',
    /** For collaborative text editing */
    TEXT = 'TEXT',
}
export enum RoomSpecifier {
    /** Unspecified data type */
    DEFAULT = 'default',
    /** Organization membership data */
    MEMBERSHIP = 'membership',
    /** Organization invites */
    INVITES = 'invites',
    /** Organization directory structure data */
    STRUCTURE = 'structure',
    /** Organization roles and permissions */
    ROLES = 'roles',
    /** Role assignment for a user */
    ROLE_ASSIGNMENTS = 'role_assignments',
    /** Directory contents */
    CONTENTS = 'contents',
}

export type RoomId = `${RoomType}@${string}` | null;

export interface MouseRoomUserData {
    contextId: UID;
    pos: Position;
    draggingList?: ListId;
    draggingCard?: CardId;
}
