import {Board, List} from "./types";

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
}
export interface ClientSEPayload {
    // Client to Server
    [ClientSE.SET_ROOM]: RoomId;
    [ClientSE.MOUSE_MOVE]: Position;
    [ClientSE.USER_IDLE]: boolean;
    [ClientSE.GET_BOARD]: string;
    [ClientSE.CREATE_BOARD]: CreateBoardType;
    [ClientSE.CREATE_LIST]: CreateListType;
}
export interface ClientSEReplies {
    // Client to Server req - Server to Client callback
    [ClientSE.SET_ROOM]: { users: UserData[] };
    [ClientSE.MOUSE_MOVE]: undefined;
    [ClientSE.USER_IDLE]: undefined;
    [ClientSE.GET_BOARD]: { board: Board | undefined };
    [ClientSE.CREATE_BOARD]: {boardID: string};
    [ClientSE.CREATE_LIST]: {success: boolean};
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
}
export interface ServerSEPayload {
    // Server to Client
    [ServerSE.READY]: void;
    [ServerSE.CLIENT_JOINED_ROOM]: UserData;
    [ServerSE.CLIENT_LEFT_ROOM]: SocketId;
    [ServerSE.MOUSE_MOVE]: { sid: SocketId; data: MouseRoomUserData };
    [ServerSE.USER_IDLE]: { sid: SocketId; idle: boolean };
    [ServerSE.ADD_LIST]: List;
}
export interface ServerSEReplies {
    // Server to Client req - Client to Server callback
    [ServerSE.READY]: void;
    [ServerSE.CLIENT_JOINED_ROOM]: void;
    [ServerSE.CLIENT_LEFT_ROOM]: void;
    [ServerSE.MOUSE_MOVE]: void;
    [ServerSE.USER_IDLE]: void;
    [ServerSE.ADD_LIST]: void;
}
export type ServerSEReply<T extends ServerSE> = (payload: ServerSEReplies[T], error?: string) => void;

export interface MouseRoomUserData extends Position {};

export interface TextRoomUserData {
    cursor: number;
    highlight: number;
}

export type Position = { x: number; y: number; }

export type RoomId = string | null;
export type SocketId = string;

export type CreateBoardType = { name:string; boardCode: string}
export type CreateListType = { boardID: string; listName: string}

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