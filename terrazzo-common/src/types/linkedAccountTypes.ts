import { URL, UserId } from './genericTypes';

export enum LinkedAccountProvider {
    Github = 'Github',
}

export interface GithubUserProfile {
    id: string;
    login: string;
    avatar_url: URL;
    name: string;
}

export interface LinkedAccount<T extends LinkedAccountProvider = LinkedAccountProvider> {
    provider: T;
    accountId: string;
    userId: UserId;
    accountData: {
        [LinkedAccountProvider.Github]: GithubUserProfile;
    }[T];
}
