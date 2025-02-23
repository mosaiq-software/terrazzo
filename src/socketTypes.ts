import {Board, BoardId, Card, CardId, List, ListId, Organization, OrganizationHeader, OrganizationId, Project, ProjectHeader, ProjectId, TextBlock, TextBlockEvent, TextBlockId, UserId, User} from "./types";

// SOCKET IO BUILT-IN EVENTS
export enum ClientSocketIOEvent {
    CONNECT = "connect",
    CONNECT_ERROR = "connect_error",
    DISCONNECT = "disconnect",
    RECONNECT = "reconnect",
    RECONNECT_ATTEMPT = "reconnect_attempt",
}
export enum ServerSocketIOEvent {
    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',
    DISCONNECTING = 'disconnecting',
}

// CLIENT SOCKET EVENTS
export enum ClientSE { // Client to Server
    SET_ROOM = "SET_ROOM",
    MOUSE_MOVE = "MOUSE_MOVE",
    USER_IDLE = "USER_IDLE",
    TEXT_CARET = "TEXT_CARET",
    MOVE_LIST = "MOVE_LIST",
    MOVE_CARD = "MOVE_CARD",

    GET_USERS_ENTITIES = "GET_USERS_ENTITIES",
    GET_ORGANIZATION = "GET_ORGANIZATION",
    GET_PROJECT = "GET_PROJECT",
    GET_BOARD = "GET_BOARD",
    GET_TEXT_BLOCK = "GET_TEXT_BLOCK",

    CREATE_ORG = "CREATE_ORG",
    CREATE_PROJECT = "CREATE_PROJECT",
    CREATE_BOARD = "CREATE_BOARD",
    CREATE_LIST = "CREATE_LIST",
    CREATE_CARD = "CREATE_CARD",

    UPDATE_TEXT_BLOCK = "UPDATE_TEXT_BLOCK",
    UPDATE_ORG_FIELD = "UPDATE_ORG_FIELD",
    UPDATE_PROJECT_FIELD = "UPDATE_PROJECT_FIELD",
    UPDATE_BOARD_FIELD = "UPDATE_BOARD_FIELD",
    UPDATE_LIST_FIELD = "UPDATE_LIST_FIELD",
    UPDATE_CARD_FIELD = "UPDATE_CARD_FIELD",

    SETUP_USER = "SETUP_USER",
    GET_USER = "GET_USER",
    CHECK_USERNAME_TAKEN = "CHECK_USERNAME_TAKEN",
}
export interface ClientSEPayload {
    // Client to Server
    [ClientSE.SET_ROOM]: RoomId;
    [ClientSE.MOUSE_MOVE]: MouseRoomUserData;
    [ClientSE.USER_IDLE]: boolean;
    [ClientSE.TEXT_CARET]: Position | undefined;
    [ClientSE.MOVE_LIST]: {listId: ListId, position: number};
    [ClientSE.MOVE_CARD]: {cardId: CardId, toList: ListId, position?: number};

    [ClientSE.GET_USERS_ENTITIES]: UserId;
    [ClientSE.GET_ORGANIZATION]: OrganizationId;
    [ClientSE.GET_PROJECT]: ProjectId;
    [ClientSE.GET_BOARD]: BoardId;
    [ClientSE.GET_TEXT_BLOCK]: TextBlockId;

    [ClientSE.CREATE_ORG]: CreateOrgType;
    [ClientSE.CREATE_PROJECT]: CreateProjectType;
    [ClientSE.CREATE_BOARD]: CreateBoardType;
    [ClientSE.CREATE_LIST]: CreateListType;
    [ClientSE.CREATE_CARD]: CreateCardType;

    [ClientSE.UPDATE_TEXT_BLOCK]: TextBlockEvent[];
    [ClientSE.UPDATE_ORG_FIELD]: (Partial<Organization> & {id: OrganizationId});
    [ClientSE.UPDATE_PROJECT_FIELD]: (Partial<Project> & {id: ProjectId});
    [ClientSE.UPDATE_BOARD_FIELD]: (Partial<Board> & {id: BoardId});
    [ClientSE.UPDATE_LIST_FIELD]: (Partial<List> & {id: ListId});
    [ClientSE.UPDATE_CARD_FIELD]: (Partial<Card> & {id: CardId});

    [ClientSE.SETUP_USER]: {id: string, username: string, firstName: string, lastName:string}
    [ClientSE.GET_USER]: string;
    [ClientSE.CHECK_USERNAME_TAKEN]: string;
}
export interface ClientSEReplies {
    // Client to Server req - Server to Client callback
    [ClientSE.SET_ROOM]: { users: UserData[] };
    [ClientSE.MOUSE_MOVE]: undefined;
    [ClientSE.USER_IDLE]: undefined;
    [ClientSE.TEXT_CARET]: undefined;
    [ClientSE.MOVE_LIST]: undefined;
    [ClientSE.MOVE_CARD]: undefined;

    [ClientSE.GET_USERS_ENTITIES]: {organizations: OrganizationHeader[], projects: ProjectHeader[]} | undefined;
    [ClientSE.GET_ORGANIZATION]: Organization | undefined;
    [ClientSE.GET_PROJECT] : Project | undefined;
    [ClientSE.GET_BOARD]: Board | undefined;
    [ClientSE.GET_TEXT_BLOCK]: TextBlock | undefined;
    
    [ClientSE.CREATE_ORG]: OrganizationId | undefined;
    [ClientSE.CREATE_PROJECT]: ProjectId | undefined;
    [ClientSE.CREATE_BOARD]: BoardId | undefined;
    [ClientSE.CREATE_LIST]: ListId | undefined;
    [ClientSE.CREATE_CARD]: CardId | undefined;
    
    [ClientSE.UPDATE_TEXT_BLOCK]: string | undefined;
    [ClientSE.UPDATE_ORG_FIELD]: undefined;
    [ClientSE.UPDATE_PROJECT_FIELD]: undefined;
    [ClientSE.UPDATE_BOARD_FIELD]: undefined;
    [ClientSE.UPDATE_LIST_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_FIELD]: undefined;
    
    [ClientSE.SETUP_USER]: {user: User | undefined};
    [ClientSE.GET_USER]: {user: User | undefined};
    [ClientSE.CHECK_USERNAME_TAKEN]: {taken:boolean};
}
export type ClientSEReply<T extends ClientSE> = (payload: ClientSEReplies[T], error?: string) => void;

// SERVER SOCKET EVENTS
export enum ServerSE { // Server to Client
    READY = "READY",
    CLIENT_JOINED_ROOM = "CLIENT_JOINED_ROOM",
    CLIENT_LEFT_ROOM = "CLIENT_LEFT_ROOM",
    
    MOUSE_MOVE = "MOUSE_MOVE",
    USER_IDLE = "USER_IDLE",
    TEXT_CARET = "TEXT_CARET",
    MOVE_LIST = "MOVE_LIST",
    MOVE_CARD = "MOVE_CARD",

    ADD_LIST = "ADD_LIST",
    ADD_CARD = "ADD_CARD",
    
    UPDATE_TEXT_BLOCK = "UPDATE_TEXT_BLOCK",
    UPDATE_BOARD_FIELD = "UPDATE_BOARD_FIELD",
    UPDATE_LIST_FIELD = "UPDATE_LIST_FIELD",
    UPDATE_CARD_FIELD = "UPDATE_CARD_FIELD",
}
export interface ServerSEPayload {
    // Server to Client
    [ServerSE.READY]: void;
    [ServerSE.CLIENT_JOINED_ROOM]: UserData;
    [ServerSE.CLIENT_LEFT_ROOM]: SocketId;

    [ServerSE.MOUSE_MOVE]: { sid: SocketId; data: MouseRoomUserData };
    [ServerSE.USER_IDLE]: { sid: SocketId; idle: boolean };
    [ServerSE.TEXT_CARET]: {sid: SocketId, caret?: Position};
    [ServerSE.MOVE_LIST]: {listId: ListId, position: number};
    [ServerSE.MOVE_CARD]: {cardId: CardId, toList: ListId, position?: number};
    
    [ServerSE.ADD_LIST]: List;
    [ServerSE.ADD_CARD]: Card;
    
    [ServerSE.UPDATE_TEXT_BLOCK]: {events: TextBlockEvent[], updated: string};
    [ServerSE.UPDATE_BOARD_FIELD]: (Partial<Board> & {id: BoardId});
    [ServerSE.UPDATE_LIST_FIELD]: (Partial<List> & {id: ListId});
    [ServerSE.UPDATE_CARD_FIELD]: (Partial<Card> & {id: CardId});
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

    [ServerSE.UPDATE_TEXT_BLOCK]: void;
    [ServerSE.UPDATE_BOARD_FIELD]: void;
    [ServerSE.UPDATE_LIST_FIELD]: void;
    [ServerSE.UPDATE_CARD_FIELD]: void;
}
export type ServerSEReply<T extends ServerSE> = (payload: ServerSEReplies[T], error?: string) => void;

export interface MouseRoomUserData {
    pos: Position;
    draggingList?: ListId;
    draggingCard?: CardId;
};

export interface TextRoomUserData {
    caret?: Position;
}

export type Position = { x: number; y: number; }

export enum RoomType {
    MOUSE = "MOUSE",
    TEXT = "TEXT"
}
export type RoomId = `${RoomType}-${string}` | null;
export type SocketId = string;

export type CreateOrgType = {name: string, creator:UserId};
export type CreateProjectType = {name: string, orgId:OrganizationId};
export type CreateBoardType = {name:string; boardCode: string, projectId: ProjectId};
export type CreateListType = {boardID: BoardId; listName: string};
export type CreateCardType = {listID: ListId; cardName: string};

export interface UserData {
    sid: SocketId;
    githubId: string;
    username: string;
    avatarUrl: string;
    fullName: string;
    idle: boolean;
    mouseRoomData?: MouseRoomUserData;
    textRoomData?: TextRoomUserData;
}