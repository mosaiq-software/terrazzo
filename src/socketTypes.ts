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

export enum SocketEventTypes {
    INITIALIZE = "INITIALIZE",
    CLIENT_CONNECT = "CLIENT_CONNECT",
    CLIENT_DISCONNECT = "CLIENT_DISCONNECT",
    CHANGE_ROOM = "CHANGE_ROOM",
    MOUSE_MOVE = "MOUSE_MOVE",
    USER_IDLE = "USER_IDLE",
}
export interface UserData {
    sid: string;
    githubId: string;
    username: string;
    avatarUrl: string;
    fullName: string;
    idle: boolean;
    mouse: {
        x?: number;
        y?: number;
    }
}
export interface SocketEventPayload {
    [SocketEventTypes.INITIALIZE]: { roomUsers: UserData[]; };
    [SocketEventTypes.CLIENT_CONNECT]: UserData;
    [SocketEventTypes.CLIENT_DISCONNECT]: { sid: string, room: string };
    [SocketEventTypes.CHANGE_ROOM]: string;
    [SocketEventTypes.MOUSE_MOVE]: { sid: string, x: number, y: number };
    [SocketEventTypes.USER_IDLE]: { sid: string, idle: boolean };
}
export interface SocketData {
    connectedAt: Date;
    access_token: string;
    user: UserData;
}