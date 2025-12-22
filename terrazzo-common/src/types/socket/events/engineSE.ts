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

export enum YjsEvent {
    DOCUMENT_UPDATE = 'document-update',
    DOCUMENT_DESTROY = 'document-destroy',
    DOCUMENT_LOADED = 'document-loaded',
    AWARENESS_UPDATE = 'awareness-update',
    SYNC_STEP_1 = 'sync-step-1',
    SYNC_UPDATE = 'sync-update',
    ALL_DOCUMENT_CONNECTIONS_CLOSED = 'all-document-connections-closed',
    UPDATE = 'update',
}
