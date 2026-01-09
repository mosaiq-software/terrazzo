import { UID, UserId } from '../genericTypes';
import { MouseRoomUserData } from './roomTypes';

export type SocketId = string;

export interface UserData {
    sid: SocketId;
    idle: boolean;
    userId: UserId;
    mouseRoomData?: MouseRoomUserData;
}

export interface SocketHandshakeAuth {
    userId: UserId | undefined;
    authToken: string | undefined;
}

export interface TextSocketHandshakeAuth extends SocketHandshakeAuth {
    resource: {
        id: UID;
        type: 'card' | 'document';
    };
}
