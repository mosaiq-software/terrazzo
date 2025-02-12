import {Board, Card, List, TextBlock, TextBlockEvent, TextBlockId} from "./types";

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
    GET_TEXT_BLOCK = "GET_TEXT_BLOCK",
    UPDATE_TEXT_BLOCK = "UPDATE_TEXT_BLOCK",
    TEXT_CARET = "TEXT_CARET",
}
export interface ClientSEPayload {
    // Client to Server
    [ClientSE.SET_ROOM]: RoomId;
    [ClientSE.MOUSE_MOVE]: Position;
    [ClientSE.USER_IDLE]: boolean;
    [ClientSE.GET_BOARD]: string;
    [ClientSE.CREATE_BOARD]: CreateBoardType;
    [ClientSE.CREATE_LIST]: CreateListType;
    [ClientSE.CREATE_CARD]: CreateCardType;
    [ClientSE.UPDATE_LIST_TITLE]: UpdateListTitleType;
    [ClientSE.GET_TEXT_BLOCK]: TextBlockId;
    [ClientSE.UPDATE_TEXT_BLOCK]: TextBlockEvent[];
    [ClientSE.TEXT_CARET]: Position;
}
export interface ClientSEReplies {
    // Client to Server req - Server to Client callback
    [ClientSE.SET_ROOM]: { users: UserData[] };
    [ClientSE.MOUSE_MOVE]: undefined;
    [ClientSE.USER_IDLE]: undefined;
    [ClientSE.GET_BOARD]: { board: Board | undefined };
    [ClientSE.CREATE_BOARD]: {boardID: string};
    [ClientSE.CREATE_LIST]: {success: boolean};
    [ClientSE.CREATE_CARD]: {success: boolean};
    [ClientSE.UPDATE_LIST_TITLE]: {success: boolean};
    [ClientSE.GET_TEXT_BLOCK]: TextBlock | undefined;
    [ClientSE.UPDATE_TEXT_BLOCK]: string | undefined;
    [ClientSE.TEXT_CARET]: undefined;
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
    UPDATE_TEXT_BLOCK = "UPDATE_TEXT_BLOCK",
    TEXT_CARET = "TEXT_CARET",
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
    [ServerSE.UPDATE_TEXT_BLOCK]: {events: TextBlockEvent[], updated: string};
    [ServerSE.TEXT_CARET]: {sid: SocketId, caret: Position};
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
    [ServerSE.UPDATE_TEXT_BLOCK]: void;
    [ServerSE.TEXT_CARET]: void;
}
export type ServerSEReply<T extends ServerSE> = (payload: ServerSEReplies[T], error?: string) => void;

export interface MouseRoomUserData extends Position {};

export interface TextRoomUserData {
    caret: Position;
}

export type Position = { x: number; y: number; }

export type RoomId = string | null;
export type SocketId = string;

export type CreateBoardType = { name:string; boardCode: string}
export type CreateListType = {boardID: string; listName: string}
export type CreateCardType = {listID: string; cardName: string}

export type UpdateListTitleType = {listID: string; title: string}

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