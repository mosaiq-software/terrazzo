import { readSessionStorageValue } from '@mantine/hooks';
import { RestRoutes } from '@mosaiq/terrazzo-common/apiTypes';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';
import { UserHeader } from '@mosaiq/terrazzo-common/types';
import { callTrzApi } from '@trz/util//apiUtils';
import { NoteType, notify } from '@trz/util/notifications';
import queryString from 'query-string';

/*
    Returns the URL to redirect to for GitHub login.
*/
export const getGithubLoginUrl = () => {
    const client_id = import.meta.env.GITHUB_AUTH_CLIENT_ID;
    const redirect_uri = `${import.meta.env.FRONTEND_URL}${import.meta.env.GITHUB_AUTH_CALLBACK_URL}`;
    const scope = ['read:user', 'user:email', 'read:org'].join(' ');
    const allow_signup = true;

    if (!client_id || !redirect_uri) {
        throw new Error('Missing required environment variables for GitHub OAuth');
    }

    const params = queryString.stringify({ client_id, redirect_uri, scope, allow_signup });
    const baseUrl = 'https://github.com/login/oauth/authorize?';
    return `${baseUrl}${params}`;
};

/*
    Get the user's access token from GitHub using the one-time code from the URL.
*/
export const getUserAccessTokenFromGithub = async (code: string) => {
    try {
        const token = await callTrzApi<RestRoutes.USER_GITHUB_AUTH>(RestRoutes.USER_GITHUB_AUTH, { code }, undefined);
        return token;
    } catch (error) {
        notify(NoteType.GITHUB_AUTH_ERROR, 'Error fetching user access token from GitHub ' + error);
        return null;
    }
};
/*
    Get the user's data from GitHub using the access token.
*/
export const getUserDataFromGithub = async (accessToken: string) => {
    try {
        const data = await callTrzApi<RestRoutes.USER_GITHUB_DATA>(RestRoutes.USER_GITHUB_DATA, { access_token: accessToken }, undefined);
        return data;
    } catch (error) {
        notify(NoteType.GITHUB_DATA_ERROR, 'Error fetching user data from GitHub ' + error);
        return null;
    }
};

/*
    Used on app load. Check if there is a saved access token in local storage and try to log in with it.
*/
export const tryLoginWithGithub = async (callbackCode?: string): Promise<{ authToken: string | null; user: UserHeader | null }> => {
    let authToken;
    let fromLocal = false;
    if (callbackCode) {
        authToken = await getUserAccessTokenFromGithub(callbackCode);
    }
    if (!authToken) {
        authToken = localStorage.getItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
        fromLocal = true;
        if (!authToken) {
            return { authToken: null, user: null };
        }
    }
    const user = await getUserDataFromGithub(authToken);
    if (!user || typeof user === 'string') {
        return { authToken: null, user: null };
    }
    const remember = readSessionStorageValue({ key: 'remember-me' });
    if (remember !== 'false' || fromLocal) {
        localStorage.setItem(LocalStorageKey.GITHUB_ACCESS_TOKEN, authToken);
    } else {
        localStorage.removeItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
    }
    return { authToken, user: user };
};

/*
    Get the user's access token from GitHub using the one-time code from the URL.
*/
export const revokeUserAccessToGithubAuth = async (access_token: string) => {
    try {
        if (!access_token) {
            return;
        }
        await callTrzApi<RestRoutes.USER_GITHUB_REVOKE_TOKEN>(RestRoutes.USER_GITHUB_REVOKE_TOKEN, { accessToken: access_token }, undefined);
    } catch (error) {
        notify(NoteType.GITHUB_AUTH_ERROR, 'Error revoking user access from GitHub ' + error);
        return null;
    }
};
