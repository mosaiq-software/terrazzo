import { URL, UserId } from './genericTypes';

export enum LinkedAccountProvider {
    Github = 'Github',
    DEV = 'DEV',
}

export interface GithubUserProfile {
    id: string;
    login: string;
    avatar_url: URL;
    name: string;
}

export interface DEVUserProfile {}

export interface LinkedAccountData {
    [LinkedAccountProvider.Github]: GithubUserProfile;
    [LinkedAccountProvider.DEV]: DEVUserProfile;
}

export interface LinkedAccount<T extends LinkedAccountProvider = LinkedAccountProvider> {
    provider: T;
    accountId: string;
    userId: UserId;
    accountData: LinkedAccountData[T];
}
