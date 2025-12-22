import { SocketId, UserData, UserId } from '@mosaiq/terrazzo-common';

export interface SocketData {
    connectedAt: Date;
    authToken: string | undefined;
    sid: SocketId;
    user: UserData | undefined;
}

export interface YSocketData {
    sid: SocketId;
    userId: UserId | undefined;
    authToken: string | undefined;
    connectedAt: Date;
}
