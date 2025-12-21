import { GithubUserProfile } from '@mosaiq/terrazzo-common';
import axios from 'axios';
import queryString from 'query-string';

export async function getGithubAccessTokenFromCode(code: string) {
    try {
        console.log('Fetching GitHub access token', { code });
        const { data } = await axios({
            url: 'https://github.com/login/oauth/access_token',
            method: 'get',
            params: {
                client_id: process.env.GITHUB_AUTH_CLIENT_ID,
                client_secret: process.env.GITHUB_AUTH_CLIENT_SECRET,
                redirect_uri: `${process.env.FRONTEND_URL}${process.env.GITHUB_AUTH_CALLBACK_URL}`,
                code,
            },
        });
        const parsedData = queryString.parse(data);
        console.log('Received GitHub access token response', { parsedData });
        if (parsedData.error) throw new Error(parsedData.error_description as string);
        return parsedData.access_token as string;
    } catch (error) {
        console.error('Error fetching GitHub access token:', error);
        return undefined;
    }
}

export async function getPrivateGitHubUserData(access_token: string): Promise<GithubUserProfile | null> {
    try {
        console.log('Fetching GitHub user data with access token', { access_token });
        const { data } = await axios({
            url: 'https://api.github.com/user',
            method: 'get',
            headers: {
                Authorization: `token ${access_token}`,
            },
        });
        console.log('Received GitHub user data', { data });
        return data;
    } catch (error) {
        console.error('Error fetching GitHub user data:', error);
        return null;
    }
}

export async function getPublicGithubUserDataFromGithubUserId(githubId: string): Promise<GithubUserProfile | null> {
    try {
        console.log('Fetching public GitHub user data for GitHub ID', { githubId });
        const { data } = await axios({
            url: `https://api.github.com/user/${githubId}`,
            method: 'get',
        });
        console.log('Received public GitHub user data', { data });
        return data;
    } catch (error) {
        console.error('Error fetching public GitHub user data:', error);
        return null;
    }
}

export const revokeGithubAuth = async (access_token: string) => {
    try {
        console.log('Revoking GitHub access token', { access_token });
        const credentials = `${process.env.GITHUB_AUTH_CLIENT_ID}:${process.env.GITHUB_AUTH_CLIENT_SECRET}`;
        const encodedCredentials = btoa(credentials);
        const response = await fetch(`https://api.github.com/applications/${process.env.GITHUB_AUTH_CLIENT_ID}/grant`, {
            method: 'DELETE',
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
            body: JSON.stringify({
                access_token: access_token,
            }),
        });
        if (!response.ok) {
            throw new Error('Server responded with an error while revoking the token');
        }
    } catch (error: any) {
        console.error('Error revoking GitHub access token:', error);
        throw new Error('Unable to revoke access token');
    }
};
