import { SocketId, UserData } from '@mosaiq/terrazzo-common';

export interface SocketData {
    connectedAt: Date;
    githubAccessToken: string | undefined;
    sid: SocketId;
    user: UserData | undefined;
}
