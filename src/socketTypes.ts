import {Board, BoardId, Card, CardId, List, ListId, Organization, OrganizationId, Project, ProjectId, TextBlock, TextBlockEvent, TextBlockId} from "./types";

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
    GET_BOARD = "GET_BOARD",
    CREATE_BOARD = "CREATE_BOARD",
    CREATE_LIST = "CREATE_LIST",
    CREATE_CARD = "CREATE_CARD",
    UPDATE_LIST_TITLE = "UPDATE_LIST_TITLE",
    UPDATE_CARD_TITLE = "UPDATE_CARD_TITLE",
    GET_TEXT_BLOCK = "GET_TEXT_BLOCK",
    UPDATE_TEXT_BLOCK = "UPDATE_TEXT_BLOCK",
    TEXT_CARET = "TEXT_CARET",
    MOVE_LIST = "MOVE_LIST",
    MOVE_CARD = "MOVE_CARD",
    UPDATE_ORG_FIELD = "UPDATE_ORG_FIELD",
    UPDATE_PROJECT_FIELD = "UPDATE_PROJECT_FIELD",
    UPDATE_BOARD_FIELD = "UPDATE_BOARD_FIELD",
    UPDATE_LIST_FIELD = "UPDATE_LIST_FIELD",
    UPDATE_CARD_FIELD = "UPDATE_CARD_FIELD",
}
export interface ClientSEPayload {
    // Client to Server
    [ClientSE.SET_ROOM]: RoomId;
    [ClientSE.MOUSE_MOVE]: MouseRoomUserData;
    [ClientSE.USER_IDLE]: boolean;
    [ClientSE.GET_BOARD]: string;
    [ClientSE.CREATE_BOARD]: CreateBoardType;
    [ClientSE.CREATE_LIST]: CreateListType;
    [ClientSE.CREATE_CARD]: CreateCardType;
    [ClientSE.UPDATE_LIST_TITLE]: UpdateListTitleType;
    [ClientSE.UPDATE_CARD_TITLE]: UpdateCardTitleType;
    [ClientSE.GET_TEXT_BLOCK]: TextBlockId;
    [ClientSE.UPDATE_TEXT_BLOCK]: TextBlockEvent[];
    [ClientSE.TEXT_CARET]: Position | undefined;
    [ClientSE.MOVE_LIST]: {listId: string, position: number};
    [ClientSE.MOVE_CARD]: {cardId: string, toList: string, position?: number};
    [ClientSE.UPDATE_ORG_FIELD]: (Partial<Organization> & {id: OrganizationId});
    [ClientSE.UPDATE_PROJECT_FIELD]: (Partial<Project> & {id: ProjectId});
    [ClientSE.UPDATE_BOARD_FIELD]: (Partial<Board> & {id: BoardId});
    [ClientSE.UPDATE_LIST_FIELD]: (Partial<List> & {id: ListId});
    [ClientSE.UPDATE_CARD_FIELD]: (Partial<Card> & {id: CardId});
}
export interface ClientSEReplies {
    // Client to Server req - Server to Client callback
    [ClientSE.SET_ROOM]: { users: UserData[] };
    [ClientSE.MOUSE_MOVE]: undefined;
    [ClientSE.USER_IDLE]: undefined;
    [ClientSE.GET_BOARD]: { board: Board | undefined };
    [ClientSE.CREATE_BOARD]: {boardID: BoardId};
    [ClientSE.CREATE_LIST]: {success: boolean};
    [ClientSE.CREATE_CARD]: {success: boolean};
    [ClientSE.UPDATE_LIST_TITLE]: {success: boolean};
    [ClientSE.UPDATE_CARD_TITLE]: {success: boolean};
    [ClientSE.GET_TEXT_BLOCK]: TextBlock | undefined;
    [ClientSE.UPDATE_TEXT_BLOCK]: string | undefined;
    [ClientSE.TEXT_CARET]: undefined;
    [ClientSE.MOVE_LIST]: undefined;
    [ClientSE.MOVE_CARD]: undefined;
    [ClientSE.UPDATE_ORG_FIELD]: undefined;
    [ClientSE.UPDATE_PROJECT_FIELD]: undefined;
    [ClientSE.UPDATE_BOARD_FIELD]: undefined;
    [ClientSE.UPDATE_LIST_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_FIELD]: undefined;
}
export type ClientSEReply<T extends ClientSE> = (payload: ClientSEReplies[T], error?: string) => void;

// SERVER SOCKET EVENTS
export enum ServerSE { // Server to Client
    READY = "READY",
    CLIENT_JOINED_ROOM = "CLIENT_JOINED_ROOM",
    CLIENT_LEFT_ROOM = "CLIENT_LEFT_ROOM",
    MOUSE_MOVE = "MOUSE_MOVE",
    USER_IDLE = "USER_IDLE",
    ADD_LIST = "ADD_LIST",
    ADD_CARD = "ADD_CARD",
    UPDATE_LIST_TITLE = "UPDATE_LIST_TITLE",
    UPDATE_CARD_TITLE = "UPDATE_CARD_TITLE",
    UPDATE_TEXT_BLOCK = "UPDATE_TEXT_BLOCK",
    TEXT_CARET = "TEXT_CARET",
    MOVE_LIST = "MOVE_LIST",
    MOVE_CARD = "MOVE_CARD",
    UPDATE_ORG_FIELD = "UPDATE_ORG_FIELD",
    UPDATE_PROJECT_FIELD = "UPDATE_PROJECT_FIELD",
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
    [ServerSE.ADD_LIST]: List;
    [ServerSE.ADD_CARD]: Card;
    [ServerSE.UPDATE_LIST_TITLE]: UpdateListTitleType;
    [ServerSE.UPDATE_CARD_TITLE]: UpdateCardTitleType;
    [ServerSE.UPDATE_TEXT_BLOCK]: {events: TextBlockEvent[], updated: string};
    [ServerSE.TEXT_CARET]: {sid: SocketId, caret?: Position};
    [ServerSE.MOVE_LIST]: {listId: ListId, position: number};
    [ServerSE.MOVE_CARD]: {cardId: CardId, toList: ListId, position?: number};
    [ServerSE.UPDATE_ORG_FIELD]: (Partial<Organization> & {id: OrganizationId});
    [ServerSE.UPDATE_PROJECT_FIELD]: (Partial<Project> & {id: ProjectId});
    [ServerSE.UPDATE_BOARD_FIELD]: (Partial<Board> & {id: BoardId});
    [ServerSE.UPDATE_LIST_FIELD]: (Partial<List> & {id: ListId});
    [ServerSE.UPDATE_CARD_FIELD]: (Partial<Card> & {id: CardId});
}
export interface ServerSEReplies {
    // Server to Client req - Client to Server callback
    [ServerSE.READY]: void;
    [ServerSE.CLIENT_JOINED_ROOM]: void;
    [ServerSE.CLIENT_LEFT_ROOM]: void;
    [ServerSE.MOUSE_MOVE]: void;
    [ServerSE.USER_IDLE]: void;
    [ServerSE.ADD_LIST]: void;
    [ServerSE.ADD_CARD]: void;
    [ServerSE.UPDATE_LIST_TITLE]: void;
    [ServerSE.UPDATE_CARD_TITLE]: void;
    [ServerSE.UPDATE_TEXT_BLOCK]: void;
    [ServerSE.TEXT_CARET]: void;
    [ServerSE.MOVE_LIST]: void;
    [ServerSE.MOVE_CARD]: void;
    [ServerSE.UPDATE_ORG_FIELD]: void;
    [ServerSE.UPDATE_PROJECT_FIELD]: void;
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

export type CreateBoardType = { name:string; boardCode: string}
export type CreateListType = {boardID: BoardId; listName: string}
export type CreateCardType = {listID: ListId; cardName: CardId}

export type UpdateListTitleType = {listID: ListId; title: string}
export type UpdateCardTitleType = {cardID: CardId; title: string}

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