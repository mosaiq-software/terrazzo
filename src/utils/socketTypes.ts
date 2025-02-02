import { UserData } from "@mosaiq/terrazzo-common/socketTypes";

export interface SocketData {
    connectedAt: Date;
    access_token: string;
    user: UserData;
}