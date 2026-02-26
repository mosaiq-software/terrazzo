import { URL, UserId } from './genericTypes';

export interface CreateUserHeader {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: URL;
}

export interface UpdateUserHeader {
    username?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: URL;
}

export interface UserHeader {
    id: UserId;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: URL;
}
