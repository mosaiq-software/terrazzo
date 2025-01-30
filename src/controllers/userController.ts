import axios from "axios";
import { Request, Response } from "express";
import queryString from "query-string";

export const githubAuth = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
        return res.status(400).send('No code provided');
    }
    const access_token = await getAccessTokenFromCode(code);
    if (!access_token) {
        return res.status(400).send('Invalid code');
    }
    res.json({ access_token });
};

export const githubUserData = async (req: Request, res: Response) => {
    const access_token = req.query.access_token as string;
    if (!access_token) {
        return res.status(400).send('No access token provided');
    }
    const userData = await getPrivateGitHubUserData(access_token);
    res.json(userData);
}

async function getAccessTokenFromCode(code:string) {
    try{
        const { data } = await axios({
            url: 'https://github.com/login/oauth/access_token',
            method: 'get',
            params: {
                client_id: process.env.GITHUB_AUTH_CLIENT_ID,
                client_secret: process.env.GITHUB_AUTH_CLIENT_SECRET,
                redirect_uri: process.env.GITHUB_AUTH_CALLBACK_URL,
                code,
            },
        });
        const parsedData = queryString.parse(data);
        if (parsedData.error) 
            throw new Error(parsedData.error_description as string);
        return parsedData.access_token as string;
    }catch(error){
        return null;
    }
};

export async function getPrivateGitHubUserData(access_token: string) {
    try{
        const { data } = await axios({
            url: 'https://api.github.com/user',
            method: 'get',
            headers: {
                Authorization: `token ${access_token}`,
            },
        });
        return data;
    } catch (error) {
        return null;
    }
};

export async function getPublicGithubUserDataFromGithubUserId(githubId: string) {
    try {
        const { data } = await axios({
            url: `https://api.github.com/user/${githubId}`,
            method: 'get',
        });
        return data;
    } catch (error) {
        return null;
    }
}

export async function getOrgMemberIds(org: string, access_token: string) {
    const members = await getOrgMembershipData(org, access_token);
    if (!members) {
        return [];
    }
    return members.map((member: any) => member.id);
}
export async function getOrgMembershipData(org: string, access_token: string) {
    try {
        const { data } = await axios({
            url: `https://api.github.com/orgs/${org}/members`,
            method: 'get',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });
        return data;
    } catch (error) {
        return null;
    }
};