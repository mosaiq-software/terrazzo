import { Board } from "./types";

export enum ClientSocketIOEvent {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    RECONNECT = "reconnect",
    RECONNECT_ATTEMPT = "reconnect_attempt",
}
export enum ServerSocketIOEvent {
    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',
    DISCONNECTING = 'disconnecting',
}

// SE = Socket Event
export enum ClientSE { // Client to Server
    SET_ROOM = "C_SET_ROOM",
    MOUSE_MOVE = "C_MOUSE_MOVE",
    USER_IDLE = "C_USER_IDLE",
    GET_BOARD = "C_GET_BOARD",
}
export enum ServerSE { // Server to Client
    CLIENT_JOINED_ROOM = "S_CLIENT_JOINED_ROOM",
    CLIENT_LEFT_ROOM = "S_CLIENT_LEFT_ROOM",
    MOUSE_MOVE = "S_MOUSE_MOVE",
    USER_IDLE = "S_USER_IDLE",
}

export interface SEPayload {
    // Client to Server
    [ClientSE.SET_ROOM]: RoomId;
    [ClientSE.MOUSE_MOVE]: Position;
    [ClientSE.USER_IDLE]: boolean;
    [ClientSE.GET_BOARD]: string;

    // Server to Client
    [ServerSE.CLIENT_JOINED_ROOM]: UserData;
    [ServerSE.CLIENT_LEFT_ROOM]: SocketId;
    [ServerSE.MOUSE_MOVE]: { sid: SocketId; data: MouseUserData };
    [ServerSE.USER_IDLE]: { sid: SocketId; idle: boolean };

}

// types for the callback functions for each event type
export interface SEReplies {
    // Client to Server req - Server to Client callback
    [ClientSE.SET_ROOM]: { users: UserData[] };
    [ClientSE.MOUSE_MOVE]: undefined;
    [ClientSE.USER_IDLE]: undefined;
    [ClientSE.GET_BOARD]: { board: Board };

    // Server to Client req - Client to Server callback
    [ServerSE.CLIENT_JOINED_ROOM]: undefined;
    [ServerSE.CLIENT_LEFT_ROOM]: undefined;
    [ServerSE.MOUSE_MOVE]: undefined;
    [ServerSE.USER_IDLE]: undefined;
}
export interface SEReply<T extends keyof SEReplies> {
    type: T;
    data: SEReplies[T];
    error?: string;
}

export interface MouseUserData extends Position {};

export interface TextUserData {
    cursor: number;
    highlight: number;
}
export interface UserGeneralData {
    githubId: string;
    username: string;
    avatarUrl: string;
    fullName: string;
    idle: boolean;
}
export interface UserData extends UserGeneralData {
    sid: SocketId;
    data: MouseUserData | TextUserData;
}

export type Position = { x: number; y: number; }

export type RoomId = string | null;
export type SocketId = string;


export interface SocketData {
    connectedAt: Date;
    access_token: string;
    user: UserData;
}