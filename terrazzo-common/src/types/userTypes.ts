import { URL, UserId } from './genericTypes';

export interface UserHeader {
    id: UserId;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: URL;
    githubUserId: string;
}

export interface GithubUserProfile {
    id: string;
    login: string;
    avatar_url: URL;
    name: string;
}
