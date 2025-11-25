import { Board, BoardId, BoardRes, Card, CardId, DirectoryHeader, DirectoryId, DocumentHeader, DocumentId, Invite, InviteId, Label, LabelId, List, ListHeader, ListId, ModuleHeaderWithChildren, Organization, OrganizationHeader, OrganizationId, PermissionLevel, QueryResult, TextBlock, TextBlockId, UID, UserHeader, UserId } from './types';

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

    PREVIEW_ORGANIZATION = 'PREVIEW_ORGANIZATION',
    PREVIEW_USER = 'PREVIEW_USER',

    CREATE_ORG = 'CREATE_ORG',
    CREATE_BOARD = 'CREATE_BOARD',
    CREATE_LIST = 'CREATE_LIST',
    CREATE_CARD = 'CREATE_CARD',
    CREATE_BOARD_LABEL = 'CREATE_BOARD_LABEL',
    CREATE_DUPLICATE_CARD = 'CREATE_DUPLICATE_CARD',
    CREATE_DOCUMENT = 'CREATE_DOCUMENT',
    CREATE_DIRECTORY = 'CREATE_DIRECTORY',

    UPDATE_ORG_FIELD = 'UPDATE_ORG_FIELD',
    UPDATE_BOARD_FIELD = 'UPDATE_BOARD_FIELD',
    UPDATE_LIST_FIELD = 'UPDATE_LIST_FIELD',
    UPDATE_CARD_FIELD = 'UPDATE_CARD_FIELD',
    UPDATE_CARD_ASSIGNEE = 'UPDATE_CARD_ASSIGNEE',
    UPDATE_BOARD_LABEL = 'UPDATE_BOARD_LABEL',
    UPDATE_CARDS_LABELS = 'UPDATE_CARDS_LABELS',
    UPDATE_DOCUMENT_FIELD = 'UPDATE_DOCUMENT_FIELD',
    UPDATE_DIRECTORY_FIELD = 'UPDATE_DIRECTORY_FIELD',

    DELETE_BOARD_LABEL = 'DELETE_BOARD_LABEL',

    SEND_INVITE = 'SEND_INVITE',
    RESPOND_INVITE = 'RESPOND_INVITE',
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

    [ClientSE.PREVIEW_ORGANIZATION]: OrganizationId;
    [ClientSE.PREVIEW_USER]: UserId;

    [ClientSE.CREATE_ORG]: { name: string };
    [ClientSE.CREATE_BOARD]: { name: string; boardCode: string; parentId: DirectoryId };
    [ClientSE.CREATE_LIST]: { boardID: BoardId; listName: string };
    [ClientSE.CREATE_CARD]: { listID: ListId; cardName: string };
    [ClientSE.CREATE_BOARD_LABEL]: { boardId: BoardId; name: string; color: string };
    [ClientSE.CREATE_DUPLICATE_CARD]: { cardId: CardId };
    [ClientSE.CREATE_DOCUMENT]: { title: string; parentId: UID };
    [ClientSE.CREATE_DIRECTORY]: { name: string; parentId: DirectoryId };

    [ClientSE.UPDATE_ORG_FIELD]: Partial<Organization> & { id: OrganizationId };
    [ClientSE.UPDATE_BOARD_FIELD]: Partial<Board> & { id: BoardId };
    [ClientSE.UPDATE_LIST_FIELD]: Partial<List> & { id: ListId };
    [ClientSE.UPDATE_CARD_FIELD]: Partial<Card> & { id: CardId };
    [ClientSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ClientSE.UPDATE_BOARD_LABEL]: { boardId: BoardId; label: Label };
    [ClientSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ClientSE.UPDATE_DOCUMENT_FIELD]: Partial<DocumentHeader> & { id: DocumentId };
    [ClientSE.UPDATE_DIRECTORY_FIELD]: Partial<DirectoryHeader> & { id: DirectoryId };

    [ClientSE.DELETE_BOARD_LABEL]: { boardId: BoardId; labelId: LabelId };

    [ClientSE.SEND_INVITE]: { toUsername: string; entityId: UID; role: PermissionLevel };
    [ClientSE.RESPOND_INVITE]: { inviteId: InviteId; response: boolean };
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
    [ClientSE.GET_ORGANIZATION]: Organization | undefined;
    [ClientSE.GET_BOARD]: BoardRes | undefined;
    [ClientSE.GET_LIST]: ListHeader | undefined;
    [ClientSE.GET_CARD]: Card | undefined;
    [ClientSE.GET_TEXT_BLOCK]: TextBlock | undefined;
    [ClientSE.GET_SEARCH_RESULTS]: { results: QueryResult[] } | undefined;
    [ClientSE.GET_DOCUMENT]: DocumentHeader | undefined;
    [ClientSE.GET_DIRECTORY]: DirectoryHeader | undefined;
    [ClientSE.GET_USERS_DIRECTORY_STRUCTURE]: ModuleHeaderWithChildren | undefined;

    [ClientSE.PREVIEW_ORGANIZATION]: OrganizationHeader | undefined;
    [ClientSE.PREVIEW_USER]: UserHeader | undefined;

    [ClientSE.CREATE_ORG]: OrganizationId | undefined;
    [ClientSE.CREATE_BOARD]: BoardId | undefined;
    [ClientSE.CREATE_LIST]: ListId | undefined;
    [ClientSE.CREATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_BOARD_LABEL]: LabelId | undefined;
    [ClientSE.CREATE_DUPLICATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_DOCUMENT]: DocumentHeader | undefined;
    [ClientSE.CREATE_DIRECTORY]: DirectoryHeader | undefined;

    [ClientSE.UPDATE_ORG_FIELD]: undefined;
    [ClientSE.UPDATE_BOARD_FIELD]: undefined;
    [ClientSE.UPDATE_LIST_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_ASSIGNEE]: undefined;
    [ClientSE.UPDATE_BOARD_LABEL]: undefined;
    [ClientSE.UPDATE_CARDS_LABELS]: undefined;
    [ClientSE.UPDATE_DOCUMENT_FIELD]: undefined;
    [ClientSE.UPDATE_DIRECTORY_FIELD]: undefined;

    [ClientSE.DELETE_BOARD_LABEL]: undefined;

    [ClientSE.SEND_INVITE]: Invite | undefined;
    [ClientSE.RESPOND_INVITE]: undefined;
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

    RECEIVE_INVITE = 'RECEIVE_INVITE',
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

    [ServerSE.UPDATE_ORG_FIELD]: Partial<Organization> & { id: OrganizationId };
    [ServerSE.UPDATE_BOARD_FIELD]: Partial<Board> & { id: BoardId };
    [ServerSE.UPDATE_LIST_FIELD]: Partial<List> & { id: ListId };
    [ServerSE.UPDATE_CARD_FIELD]: Partial<Card> & { id: CardId };
    [ServerSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ServerSE.UPDATE_BOARD_LABELS]: { boardId: BoardId; labels: Label[] };
    [ServerSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ServerSE.UPDATE_DOCUMENT_FIELD]: Partial<DocumentHeader> & { id: DocumentId };
    [ServerSE.UPDATE_DIRECTORY_FIELD]: Partial<DirectoryHeader> & { id: DirectoryId };
    [ServerSE.UPDATE_USERS_DIRECTORY_STRUCTURE]: { userId: UserId; orgId: OrganizationId; directoryStructure: ModuleHeaderWithChildren };

    [ServerSE.RECEIVE_INVITE]: Invite;
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

    [ServerSE.RECEIVE_INVITE]: void;
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
