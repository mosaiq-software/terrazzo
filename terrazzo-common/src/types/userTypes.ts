import { URL, UserId } from './genericTypes';

export interface UserHeader {
    id: UserId;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: URL;
}
