import { UserId } from './genericTypes';
import { UserHeader } from './userTypes';

export enum AuthProvider {
    Github = 'Github',
    DEV = 'DEV',
}

export interface AuthSession {
    userId: UserId;
    authToken: string;
    createdAt: number;
}

export interface AuthProviderToken {
    provider: AuthProvider;
    providerAuthToken: string;
}

export interface UserHeaderWithAuth extends UserHeader {
    authToken: string;
}
