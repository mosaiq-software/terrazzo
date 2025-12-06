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
