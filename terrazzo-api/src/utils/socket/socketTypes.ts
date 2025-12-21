import { SocketId, UserData } from '@mosaiq/terrazzo-common';

export interface SocketData {
    connectedAt: Date;
    authToken: string | undefined;
    sid: SocketId;
    user: UserData | undefined;
}
