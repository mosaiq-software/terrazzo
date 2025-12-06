import { UserData } from '@mosaiq/terrazzo-common';

export interface SocketData {
    connectedAt: Date;
    githubAccessToken: string;
    user: UserData;
}
