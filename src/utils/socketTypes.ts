import { UserData } from "@mosaiq/terrazzo-common/socketTypes";

export interface SocketData {
    connectedAt: Date;
    githubAccessToken: string;
    user: UserData;
}