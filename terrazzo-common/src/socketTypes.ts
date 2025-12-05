import { Board, BoardId, BoardRes, Card, CardId, DirectoryHeader, DirectoryId, DocumentHeader, DocumentId, Invite, InviteId, Label, LabelId, List, ListHeader, ListId, Member, ModuleHeaderWithChildren, OrganizationHeader, OrganizationId, OrgMembershipLevel, QueryResult, Role, RoleId, TextBlock, TextBlockId, UID, UserHeader, UserId } from './types';

// SOCKET IO BUILT-IN EVENTS
export enum ClientSocketIOEvent {
    CONNECT = 'connect',
    CONNECT_ERROR = 'connect_error',
    DISCONNECT = 'disconnect',
    RECONNECT = 'reconnect',
    RECONNECT_ATTEMPT = 'reconnect_attempt',
}
export enum ServerSocketIOEvent {
    CONNECTION = 'connection',
    CONNECTION_ERROR = 'connection_error',
    DISCONNECT = 'disconnect',
    DISCONNECTING = 'disconnecting',
}

// CLIENT SOCKET EVENTS
export enum ClientSE {
    // Client to Server
    JOIN_ROOM = 'JOIN_ROOM',
    LEAVE_ROOM = 'LEAVE_ROOM',
    MOUSE_MOVE = 'MOUSE_MOVE',
    USER_IDLE = 'USER_IDLE',
    TEXT_CARET = 'TEXT_CARET',
    MOVE_LIST = 'MOVE_LIST',
    MOVE_CARD = 'MOVE_CARD',

    GET_USERS_ORGANIZATIONS = 'GET_USERS_ORGANIZATIONS',
    GET_ORGANIZATION = 'GET_ORGANIZATION',
    GET_BOARD = 'GET_BOARD',
    GET_LIST = 'GET_LIST',
    GET_CARD = 'GET_CARD',
    GET_TEXT_BLOCK = 'GET_TEXT_BLOCK',
    GET_SEARCH_RESULTS = 'GET_SEARCH_RESULTS',
    GET_DOCUMENT = 'GET_DOCUMENT',
    GET_DIRECTORY = 'GET_DIRECTORY',
    GET_USERS_DIRECTORY_STRUCTURE = 'GET_USERS_DIRECTORY_STRUCTURE',
    GET_INVITES_FOR_ORG = 'GET_INVITES_FOR_ORG',
    GET_INVITE = 'GET_INVITE',
    GET_USER = 'GET_USER',
    GET_ORGANIZATION_MEMBERSHIPS = 'GET_ORGANIZATION_MEMBERSHIPS',
    GET_ROLES_FOR_ORG = 'GET_ROLES_FOR_ORG',
    GET_ROLES_FOR_USER_IN_ORG = 'GET_ROLES_FOR_USER_IN_ORG',

    CREATE_ORG = 'CREATE_ORG',
    CREATE_BOARD = 'CREATE_BOARD',
    CREATE_LIST = 'CREATE_LIST',
    CREATE_CARD = 'CREATE_CARD',
    CREATE_BOARD_LABEL = 'CREATE_BOARD_LABEL',
    CREATE_DUPLICATE_CARD = 'CREATE_DUPLICATE_CARD',
    CREATE_DOCUMENT = 'CREATE_DOCUMENT',
    CREATE_DIRECTORY = 'CREATE_DIRECTORY',
    CREATE_INVITE = 'CREATE_INVITE',
    CREATE_ROLE = 'CREATE_ROLE',

    UPDATE_ORG_FIELD = 'UPDATE_ORG_FIELD',
    UPDATE_BOARD_FIELD = 'UPDATE_BOARD_FIELD',
    UPDATE_LIST_FIELD = 'UPDATE_LIST_FIELD',
    UPDATE_CARD_FIELD = 'UPDATE_CARD_FIELD',
    UPDATE_CARD_ASSIGNEE = 'UPDATE_CARD_ASSIGNEE',
    UPDATE_BOARD_LABEL = 'UPDATE_BOARD_LABEL',
    UPDATE_CARDS_LABELS = 'UPDATE_CARDS_LABELS',
    UPDATE_DOCUMENT_FIELD = 'UPDATE_DOCUMENT_FIELD',
    UPDATE_DIRECTORY_FIELD = 'UPDATE_DIRECTORY_FIELD',
    UPDATE_MEMBERSHIP = 'UPDATE_MEMBERSHIP',
    UPDATE_ROLE = 'UPDATE_ROLE',
    UPDATE_ROLES_FOR_USER_IN_ORG = 'UPDATE_ROLES_FOR_USER_IN_ORG',

    DELETE_BOARD_LABEL = 'DELETE_BOARD_LABEL',
    DELETE_INVITE = 'DELETE_INVITE',
    DELETE_MEMBERSHIP = 'DELETE_MEMBERSHIP',
    DELETE_ROLE = 'DELETE_ROLE',

    USE_INVITE = 'USE_INVITE',
}
export interface ClientSEPayload {
    // Client to Server
    [ClientSE.JOIN_ROOM]: RoomId;
    [ClientSE.LEAVE_ROOM]: RoomId;
    [ClientSE.MOUSE_MOVE]: MouseRoomUserData;
    [ClientSE.USER_IDLE]: boolean;
    [ClientSE.TEXT_CARET]: Position | undefined;
    [ClientSE.MOVE_LIST]: { listId: ListId; position: number };
    [ClientSE.MOVE_CARD]: { cardId: CardId; toList: ListId; position?: number };

    [ClientSE.GET_USERS_ORGANIZATIONS]: UserId;
    [ClientSE.GET_ORGANIZATION]: OrganizationId;
    [ClientSE.GET_BOARD]: BoardId;
    [ClientSE.GET_LIST]: ListId;
    [ClientSE.GET_CARD]: CardId;
    [ClientSE.GET_TEXT_BLOCK]: TextBlockId;
    [ClientSE.GET_SEARCH_RESULTS]: { query: string; searchSessionId: string };
    [ClientSE.GET_DOCUMENT]: DocumentId;
    [ClientSE.GET_DIRECTORY]: DirectoryId;
    [ClientSE.GET_USERS_DIRECTORY_STRUCTURE]: { userId: UserId; orgId: OrganizationId };
    [ClientSE.GET_INVITES_FOR_ORG]: OrganizationId;
    [ClientSE.GET_INVITE]: InviteId;
    [ClientSE.GET_USER]: UserId;
    [ClientSE.GET_ORGANIZATION_MEMBERSHIPS]: OrganizationId;
    [ClientSE.GET_ROLES_FOR_ORG]: OrganizationId;
    [ClientSE.GET_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId };

    [ClientSE.CREATE_ORG]: { name: string };
    [ClientSE.CREATE_BOARD]: { name: string; boardCode: string; parentId: DirectoryId };
    [ClientSE.CREATE_LIST]: { boardID: BoardId; listName: string };
    [ClientSE.CREATE_CARD]: { listID: ListId; cardName: string };
    [ClientSE.CREATE_BOARD_LABEL]: { boardId: BoardId; name: string; color: string };
    [ClientSE.CREATE_DUPLICATE_CARD]: { cardId: CardId };
    [ClientSE.CREATE_DOCUMENT]: { title: string; parentId: UID };
    [ClientSE.CREATE_DIRECTORY]: { name: string; parentId: DirectoryId };
    [ClientSE.CREATE_INVITE]: { orgId: OrganizationId; maxUses: number | null };
    [ClientSE.CREATE_ROLE]: { orgId: OrganizationId; name: string; color: string };

    [ClientSE.UPDATE_ORG_FIELD]: Partial<OrganizationHeader> & { id: OrganizationId };
    [ClientSE.UPDATE_BOARD_FIELD]: Partial<Board> & { id: BoardId };
    [ClientSE.UPDATE_LIST_FIELD]: Partial<List> & { id: ListId };
    [ClientSE.UPDATE_CARD_FIELD]: Partial<Card> & { id: CardId };
    [ClientSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ClientSE.UPDATE_BOARD_LABEL]: { boardId: BoardId; label: Label };
    [ClientSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ClientSE.UPDATE_DOCUMENT_FIELD]: Partial<DocumentHeader> & { id: DocumentId };
    [ClientSE.UPDATE_DIRECTORY_FIELD]: Partial<DirectoryHeader> & { id: DirectoryId };
    [ClientSE.UPDATE_MEMBERSHIP]: { userId: UserId; orgId: OrganizationId; newPermissionLevel: OrgMembershipLevel };
    [ClientSE.UPDATE_ROLE]: Role;
    [ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId; roleIds: RoleId[] };

    [ClientSE.DELETE_BOARD_LABEL]: { boardId: BoardId; labelId: LabelId };
    [ClientSE.DELETE_INVITE]: { inviteId: InviteId };
    [ClientSE.DELETE_MEMBERSHIP]: { userId: UserId; orgId: OrganizationId };
    [ClientSE.DELETE_ROLE]: { roleId: RoleId };

    [ClientSE.USE_INVITE]: { inviteId: InviteId };
}
export interface ClientSEReplies {
    // Client to Server req - Server to Client callback
    [ClientSE.JOIN_ROOM]: UserData[];
    [ClientSE.LEAVE_ROOM]: undefined;
    [ClientSE.MOUSE_MOVE]: undefined;
    [ClientSE.USER_IDLE]: undefined;
    [ClientSE.TEXT_CARET]: undefined;
    [ClientSE.MOVE_LIST]: undefined;
    [ClientSE.MOVE_CARD]: undefined;

    [ClientSE.GET_USERS_ORGANIZATIONS]: OrganizationHeader[];
    [ClientSE.GET_ORGANIZATION]: OrganizationHeader | undefined;
    [ClientSE.GET_BOARD]: BoardRes | undefined;
    [ClientSE.GET_LIST]: ListHeader | undefined;
    [ClientSE.GET_CARD]: Card | undefined;
    [ClientSE.GET_TEXT_BLOCK]: TextBlock | undefined;
    [ClientSE.GET_SEARCH_RESULTS]: { results: QueryResult[] } | undefined;
    [ClientSE.GET_DOCUMENT]: DocumentHeader | undefined;
    [ClientSE.GET_DIRECTORY]: DirectoryHeader | undefined;
    [ClientSE.GET_USERS_DIRECTORY_STRUCTURE]: ModuleHeaderWithChildren | undefined;
    [ClientSE.GET_INVITES_FOR_ORG]: Invite[] | undefined;
    [ClientSE.GET_INVITE]: Invite | undefined;
    [ClientSE.GET_USER]: UserHeader | undefined;
    [ClientSE.GET_ORGANIZATION_MEMBERSHIPS]: Member[] | undefined;
    [ClientSE.GET_ROLES_FOR_ORG]: Role[] | undefined;
    [ClientSE.GET_ROLES_FOR_USER_IN_ORG]: RoleId[] | undefined;

    [ClientSE.CREATE_ORG]: OrganizationId | undefined;
    [ClientSE.CREATE_BOARD]: BoardId | undefined;
    [ClientSE.CREATE_LIST]: ListId | undefined;
    [ClientSE.CREATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_BOARD_LABEL]: LabelId | undefined;
    [ClientSE.CREATE_DUPLICATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_DOCUMENT]: DocumentHeader | undefined;
    [ClientSE.CREATE_DIRECTORY]: DirectoryHeader | undefined;
    [ClientSE.CREATE_INVITE]: Invite | undefined;
    [ClientSE.CREATE_ROLE]: Role | undefined;

    [ClientSE.UPDATE_ORG_FIELD]: undefined;
    [ClientSE.UPDATE_BOARD_FIELD]: undefined;
    [ClientSE.UPDATE_LIST_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_ASSIGNEE]: undefined;
    [ClientSE.UPDATE_BOARD_LABEL]: undefined;
    [ClientSE.UPDATE_CARDS_LABELS]: undefined;
    [ClientSE.UPDATE_DOCUMENT_FIELD]: undefined;
    [ClientSE.UPDATE_DIRECTORY_FIELD]: undefined;
    [ClientSE.UPDATE_MEMBERSHIP]: undefined;
    [ClientSE.UPDATE_ROLE]: undefined;
    [ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG]: undefined;

    [ClientSE.DELETE_BOARD_LABEL]: undefined;
    [ClientSE.DELETE_INVITE]: undefined;
    [ClientSE.DELETE_MEMBERSHIP]: undefined;
    [ClientSE.DELETE_ROLE]: undefined;

    [ClientSE.USE_INVITE]: boolean;
}
export type ClientSEReply<T extends ClientSE> = (payload: ClientSEReplies[T], error?: string) => void;

// SERVER SOCKET EVENTS
export enum ServerSE {
    // Server to Client
    READY = 'READY',
    CLIENT_JOINED_ROOM = 'CLIENT_JOINED_ROOM',
    CLIENT_LEFT_ROOM = 'CLIENT_LEFT_ROOM',

    MOUSE_MOVE = 'MOUSE_MOVE',
    USER_IDLE = 'USER_IDLE',
    TEXT_CARET = 'TEXT_CARET',
    MOVE_LIST = 'MOVE_LIST',
    MOVE_CARD = 'MOVE_CARD',

    ADD_LIST = 'ADD_LIST',
    ADD_CARD = 'ADD_CARD',

    UPDATE_ORG_FIELD = 'UPDATE_ORG_FIELD',
    UPDATE_BOARD_FIELD = 'UPDATE_BOARD_FIELD',
    UPDATE_LIST_FIELD = 'UPDATE_LIST_FIELD',
    UPDATE_CARD_FIELD = 'UPDATE_CARD_FIELD',
    UPDATE_CARD_ASSIGNEE = 'UPDATE_CARD_ASSIGNEE',
    UPDATE_BOARD_LABELS = 'UPDATE_BOARD_LABELS',
    UPDATE_CARDS_LABELS = 'UPDATE_CARDS_LABELS',
    UPDATE_DOCUMENT_FIELD = 'UPDATE_DOCUMENT_FIELD',
    UPDATE_DIRECTORY_FIELD = 'UPDATE_DIRECTORY_FIELD',
    UPDATE_USERS_DIRECTORY_STRUCTURE = 'UPDATE_USERS_DIRECTORY_STRUCTURE',
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
    [ServerSE.TEXT_CARET]: { sid: SocketId; caret?: Position };
    [ServerSE.MOVE_LIST]: { listId: ListId; position: number };
    [ServerSE.MOVE_CARD]: { cardId: CardId; toList: ListId; position?: number };

    [ServerSE.ADD_LIST]: List;
    [ServerSE.ADD_CARD]: Card;

    [ServerSE.UPDATE_ORG_FIELD]: Partial<OrganizationHeader> & { id: OrganizationId };
    [ServerSE.UPDATE_BOARD_FIELD]: Partial<Board> & { id: BoardId };
    [ServerSE.UPDATE_LIST_FIELD]: Partial<List> & { id: ListId };
    [ServerSE.UPDATE_CARD_FIELD]: Partial<Card> & { id: CardId };
    [ServerSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ServerSE.UPDATE_BOARD_LABELS]: { boardId: BoardId; labels: Label[] };
    [ServerSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ServerSE.UPDATE_DOCUMENT_FIELD]: Partial<DocumentHeader> & { id: DocumentId };
    [ServerSE.UPDATE_DIRECTORY_FIELD]: Partial<DirectoryHeader> & { id: DirectoryId };
    [ServerSE.UPDATE_USERS_DIRECTORY_STRUCTURE]: { userId: UserId; orgId: OrganizationId; directoryStructure: ModuleHeaderWithChildren };
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

    [ServerSE.TEXT_CARET]: void;
    [ServerSE.MOVE_LIST]: void;
    [ServerSE.MOVE_CARD]: void;
    [ServerSE.MOUSE_MOVE]: void;
    [ServerSE.USER_IDLE]: void;

    [ServerSE.ADD_LIST]: void;
    [ServerSE.ADD_CARD]: void;

    [ServerSE.UPDATE_ORG_FIELD]: void;
    [ServerSE.UPDATE_BOARD_FIELD]: void;
    [ServerSE.UPDATE_LIST_FIELD]: void;
    [ServerSE.UPDATE_CARD_FIELD]: void;
    [ServerSE.UPDATE_CARD_ASSIGNEE]: void;
    [ServerSE.UPDATE_BOARD_LABELS]: void;
    [ServerSE.UPDATE_CARDS_LABELS]: void;
    [ServerSE.UPDATE_DOCUMENT_FIELD]: void;
    [ServerSE.UPDATE_DIRECTORY_FIELD]: void;
    [ServerSE.UPDATE_USERS_DIRECTORY_STRUCTURE]: void;
    [ServerSE.UPDATE_USERS_ORGANIZATIONS]: void;
    [ServerSE.UPDATE_ORGANIZATION_MEMBERSHIPS]: void;
    [ServerSE.UPDATE_ORGANIZATION_INVITES]: void;
    [ServerSE.UPDATE_ORGANIZATION_ROLES]: void;
    [ServerSE.UPDATE_ROLES_FOR_USER_IN_ORG]: void;
}
export type ServerSEReply<T extends ServerSE> = (payload: ServerSEReplies[T], error?: string) => void;

export interface MouseRoomUserData {
    pos: Position;
    draggingList?: ListId;
    draggingCard?: CardId;
}

export interface TextRoomUserData {
    caret?: Position;
}

export type Position = { x: number; y: number };

export enum RoomType {
    INVALID_DO_NOT_USE = 'INVALID', // Capture case. Do not use!
    MOUSE = 'MOUSE', // Show others mouse cursors / dragging
    TEXT = 'TEXT', // For collaborative text area only
    USER = 'USER', // For sending updates to a specific UserId's socket
    DATA = 'DATA', // For updating arbitrary fields realtime
}
export type RoomId = `${RoomType}@${string}` | null;
export type SocketId = string;

export interface UserData {
    sid: SocketId;
    idle: boolean;
    user: UserHeader;
    mouseRoomData?: MouseRoomUserData;
    textRoomData?: TextRoomUserData;
}

export interface SocketHandshakeAuth {
    userId: UserId;
    githubToken: string;
}
