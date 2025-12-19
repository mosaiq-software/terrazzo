import { BoardId, CardId, DirectoryId, DocumentId, LabelId, ListId, OrganizationId, RoleId, UserId } from '../../genericTypes';
import { Invite } from '../../inviteTypes';
import { BoardHeader, Label } from '../../modules/board/boardTypes';
import { Card, CardHeader } from '../../modules/board/cardTypes';
import { List, ListHeader } from '../../modules/board/listTypes';
import { DirectoryHeader } from '../../modules/directoryTypes';
import { DocumentHeader } from '../../modules/documentTypes';
import { ModuleHeader } from '../../modules/moduleTypes';
import { Member, OrganizationHeader } from '../../organizationTypes';
import { Role } from '../../permissions/roleTypes';
import { UserHeader } from '../../userTypes';
import { MouseRoomUserData } from '../roomTypes';
import { SocketId, UserData } from '../socketTypes';

// SERVER SOCKET EVENTS
export enum ServerSE {
    // Server to Client
    READY = 'READY',
    CLIENT_JOINED_ROOM = 'CLIENT_JOINED_ROOM',
    CLIENT_LEFT_ROOM = 'CLIENT_LEFT_ROOM',

    MOUSE_MOVE = 'MOUSE_MOVE',
    USER_IDLE = 'USER_IDLE',
    MOVE_LIST = 'MOVE_LIST',
    MOVE_CARD = 'MOVE_CARD',

    ADD_LIST = 'ADD_LIST',
    ADD_CARD = 'ADD_CARD',

    UPDATE_USER_FIELD = 'UPDATE_USER_FIELD',
    UPDATE_ORG_FIELD = 'UPDATE_ORG_FIELD',
    UPDATE_BOARD_FIELD = 'UPDATE_BOARD_FIELD',
    UPDATE_LIST_FIELD = 'UPDATE_LIST_FIELD',
    UPDATE_CARD_FIELD = 'UPDATE_CARD_FIELD',
    UPDATE_CARD_ASSIGNEE = 'UPDATE_CARD_ASSIGNEE',
    UPDATE_BOARD_LABELS = 'UPDATE_BOARD_LABELS',
    UPDATE_CARDS_LABELS = 'UPDATE_CARDS_LABELS',
    UPDATE_DOCUMENT_FIELD = 'UPDATE_DOCUMENT_FIELD',
    UPDATE_DIRECTORY_FIELD = 'UPDATE_DIRECTORY_FIELD',
    UPDATE_DIRECTORY_CONTENTS = 'UPDATE_DIRECTORY_CONTENTS',
    UPDATE_USERS_ORGANIZATIONS = 'UPDATE_USERS_ORGANIZATIONS',
    UPDATE_ORGANIZATION_MEMBERSHIPS = 'UPDATE_ORGANIZATION_MEMBERSHIPS',
    UPDATE_ORGANIZATION_INVITES = 'UPDATE_ORGANIZATION_INVITES',
    UPDATE_ORGANIZATION_ROLES = 'UPDATE_ORGANIZATION_ROLES',
    UPDATE_ROLES_FOR_USER_IN_ORG = 'UPDATE_ROLES_FOR_USER_IN_ORG',
}
export interface ServerSEPayload {
    // Server to Client
    [ServerSE.READY]: void;
    [ServerSE.CLIENT_JOINED_ROOM]: UserData;
    [ServerSE.CLIENT_LEFT_ROOM]: SocketId;

    [ServerSE.MOUSE_MOVE]: { sid: SocketId; data: MouseRoomUserData };
    [ServerSE.USER_IDLE]: { sid: SocketId; idle: boolean };
    [ServerSE.MOVE_LIST]: { listId: ListId; position: number };
    [ServerSE.MOVE_CARD]: { cardId: CardId; toList: ListId; position?: number };

    [ServerSE.ADD_LIST]: List;
    [ServerSE.ADD_CARD]: Card;

    [ServerSE.UPDATE_USER_FIELD]: Partial<UserHeader> & { id: UserId };
    [ServerSE.UPDATE_ORG_FIELD]: Partial<OrganizationHeader> & { id: OrganizationId };
    [ServerSE.UPDATE_BOARD_FIELD]: Partial<BoardHeader> & { id: BoardId };
    [ServerSE.UPDATE_LIST_FIELD]: Partial<ListHeader> & { id: ListId };
    [ServerSE.UPDATE_CARD_FIELD]: Partial<CardHeader> & { id: CardId };
    [ServerSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ServerSE.UPDATE_BOARD_LABELS]: { boardId: BoardId; labels: Label[] };
    [ServerSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ServerSE.UPDATE_DOCUMENT_FIELD]: Partial<DocumentHeader> & { id: DocumentId };
    [ServerSE.UPDATE_DIRECTORY_FIELD]: Partial<DirectoryHeader> & { id: DirectoryId };
    [ServerSE.UPDATE_DIRECTORY_CONTENTS]: { directoryId: DirectoryId; contents: (ModuleHeader & { canAccess: boolean })[] };
    [ServerSE.UPDATE_USERS_ORGANIZATIONS]: { userId: UserId; organizations: OrganizationHeader[] };
    [ServerSE.UPDATE_ORGANIZATION_MEMBERSHIPS]: { orgId: OrganizationId; members: Member[] };
    [ServerSE.UPDATE_ORGANIZATION_INVITES]: { orgId: OrganizationId; invites: Invite[] };
    [ServerSE.UPDATE_ORGANIZATION_ROLES]: { orgId: OrganizationId; roles: Role[] };
    [ServerSE.UPDATE_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId; roleIds: RoleId[] };
}
export interface ServerSEReplies {
    // Server to Client req - Client to Server callback
    [ServerSE.READY]: void;
    [ServerSE.CLIENT_JOINED_ROOM]: void;
    [ServerSE.CLIENT_LEFT_ROOM]: void;

    [ServerSE.MOVE_LIST]: void;
    [ServerSE.MOVE_CARD]: void;
    [ServerSE.MOUSE_MOVE]: void;
    [ServerSE.USER_IDLE]: void;

    [ServerSE.ADD_LIST]: void;
    [ServerSE.ADD_CARD]: void;

    [ServerSE.UPDATE_USER_FIELD]: void;
    [ServerSE.UPDATE_ORG_FIELD]: void;
    [ServerSE.UPDATE_BOARD_FIELD]: void;
    [ServerSE.UPDATE_LIST_FIELD]: void;
    [ServerSE.UPDATE_CARD_FIELD]: void;
    [ServerSE.UPDATE_CARD_ASSIGNEE]: void;
    [ServerSE.UPDATE_BOARD_LABELS]: void;
    [ServerSE.UPDATE_CARDS_LABELS]: void;
    [ServerSE.UPDATE_DOCUMENT_FIELD]: void;
    [ServerSE.UPDATE_DIRECTORY_FIELD]: void;
    [ServerSE.UPDATE_DIRECTORY_CONTENTS]: void;
    [ServerSE.UPDATE_USERS_ORGANIZATIONS]: void;
    [ServerSE.UPDATE_ORGANIZATION_MEMBERSHIPS]: void;
    [ServerSE.UPDATE_ORGANIZATION_INVITES]: void;
    [ServerSE.UPDATE_ORGANIZATION_ROLES]: void;
    [ServerSE.UPDATE_ROLES_FOR_USER_IN_ORG]: void;
}
export type ServerSEReply<T extends ServerSE> = (payload: ServerSEReplies[T], error?: string) => void;
