import { UserId } from '../genericTypes';
import { UserHeader } from '../userTypes';
import { MouseRoomUserData, TextRoomUserData } from './roomTypes';

export type SocketId = string;

export interface UserData {
    sid: SocketId;
    idle: boolean;
    user: UserHeader;
    mouseRoomData?: MouseRoomUserData;
    textRoomData?: TextRoomUserData;
}

export interface SocketHandshakeAuth {
    userId: UserId;
    githubToken: string;
}
