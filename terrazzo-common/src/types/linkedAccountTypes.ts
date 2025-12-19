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

interface BaseLinkedAccount {
    accountId: string;
    userId: UserId;
}

interface GithubLinkedAccount extends BaseLinkedAccount {
    provider: LinkedAccountProvider.Github;
    accountData: GithubUserProfile;
}

interface DEVLinkedAccount extends BaseLinkedAccount {
    provider: LinkedAccountProvider.DEV;
    accountData: DEVUserProfile;
}

export type LinkedAccount = GithubLinkedAccount | DEVLinkedAccount;
