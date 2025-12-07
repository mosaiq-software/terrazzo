import { CardId, ListId, Position, UID } from '../genericTypes';

export enum RoomType {
    INVALID_DO_NOT_USE = 'INVALID', // Capture case. Do not use!
    MOUSE = 'MOUSE', // Show others mouse cursors / dragging
    USER = 'USER', // For sending updates to a specific UserId's socket
    DATA = 'DATA', // For updating arbitrary fields realtime
}
export enum RoomSpecifier {
    DEFAULT = 'default',
    MEMBERSHIP = 'membership',
    INVITES = 'invites',
    STRUCTURE = 'structure',
    ROLES = 'roles',
    ROLE_ASSIGNMENTS = 'role_assignments',
    CONTENTS = 'contents',
}

export type RoomId = `${RoomType}@${string}` | null;

export interface MouseRoomUserData {
    contextId: UID;
    pos: Position;
    draggingList?: ListId;
    draggingCard?: CardId;
}
