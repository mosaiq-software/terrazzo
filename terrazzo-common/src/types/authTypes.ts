import { UserId } from './genericTypes';
import { UserHeader } from './userTypes';

export enum AuthProvider {
    Github = 'Github',
    DEV = 'DEV',
}

export interface UserIdWithAuth {
    userId: UserId;
    authToken: string;
}

export interface AuthSession extends UserIdWithAuth {
    createdAt: number;
}

export interface AuthProviderToken {
    provider: AuthProvider;
    providerAuthToken: string;
}

export interface ExistingAuthToken {
    userId: UserId;
    trzAuthToken: string;
}

export interface UserHeaderWithAuth extends UserHeader {
    authToken: string;
}

export type AuthProviderCallbackBody =
    | {
          provider: AuthProvider.Github;
          code?: string;
          accessToken?: string;
      }
    | {
          provider: AuthProvider.DEV;
          username: string;
      };

export type AuthProviderCallbackData = AuthProviderCallbackBody & { auth?: UserIdWithAuth };
