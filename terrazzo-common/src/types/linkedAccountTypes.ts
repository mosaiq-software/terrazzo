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

interface BaseLinkedAccount {
    accountId: string;
    userId: UserId;
    accountData: {};
    privateAccountData?: {};
}

export interface GithubLinkedAccount extends BaseLinkedAccount {
    provider: LinkedAccountProvider.Github;
    accountData: GithubUserProfile;
    privateAccountData?: {
        accessToken: string;
    };
}

export interface DEVLinkedAccount extends BaseLinkedAccount {
    provider: LinkedAccountProvider.DEV;
}

export type LinkedAccount = GithubLinkedAccount | DEVLinkedAccount;
