import { CollectionSourceData, ObjectSourceData } from '../../dataSource/dataSourceTypes';
import { CardId, ListId, UserId } from '../../genericTypes';
import { LinkedAccount } from '../../linkedAccountTypes';
import { MouseRoomUserData } from '../roomTypes';
import { SocketId, UserData } from '../socketTypes';

// SERVER SOCKET EVENTS
export enum ServerSE {
    // Server to Client
    READY = 'READY',
    CLIENT_JOINED_ROOM = 'CLIENT_JOINED_ROOM',
    CLIENT_LEFT_ROOM = 'CLIENT_LEFT_ROOM',

    MOUSE_MOVE = 'MOUSE_MOVE',
    USER_IDLE = 'USER_IDLE',
    MOVE_LIST = 'MOVE_LIST',
    MOVE_CARD = 'MOVE_CARD',

    UPDATE_USERS_LINKED_ACCOUNTS = 'UPDATE_USERS_LINKED_ACCOUNTS',

    OBJECT_SOURCE_UPDATE = 'OBJECT_SOURCE_UPDATE',
    COLLECTION_SOURCE_UPDATE = 'COLLECTION_SOURCE_UPDATE',
}
export interface ServerSEPayload {
    // Server to Client
    [ServerSE.READY]: void;
    [ServerSE.CLIENT_JOINED_ROOM]: UserData;
    [ServerSE.CLIENT_LEFT_ROOM]: SocketId;

    [ServerSE.MOUSE_MOVE]: { sid: SocketId; data: MouseRoomUserData };
    [ServerSE.USER_IDLE]: { sid: SocketId; idle: boolean };
    [ServerSE.MOVE_LIST]: { listId: ListId; position: number | null };
    [ServerSE.MOVE_CARD]: { cardId: CardId; toList: ListId; position?: number | null };

    [ServerSE.UPDATE_USERS_LINKED_ACCOUNTS]: { userId: UserId; linkedAccounts: LinkedAccount[] };

    [ServerSE.OBJECT_SOURCE_UPDATE]: ObjectSourceData;
    [ServerSE.COLLECTION_SOURCE_UPDATE]: CollectionSourceData;
}

export type ServerSEReply = (payload: void, error?: string) => void;
