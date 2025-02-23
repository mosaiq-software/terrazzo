import { EntityType } from "@mosaiq/terrazzo-common/constants";
import { OrganizationHeader, ProjectHeader, UserId } from "@mosaiq/terrazzo-common/types";
import { getMembershipRecordsForUser } from "@trz-api/persistence/membershipPersistence";
import { getOrgById } from "@trz-api/persistence/organizationPersistence";
import { getProjectById } from "@trz-api/persistence/projectPersistence";
import { validateGithubAuthToken } from "@trz-api/utils/authUtils";
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
    try{
        await validateGithubAuthToken(access_token);
    } catch (error: any) {
        res.status(401).json(error.message);
        return;
    }
    res.status(200).json({ access_token });
};

export const githubUserData = async (req: Request, res: Response) => {
    const access_token = req.query.access_token as string;
    if (!access_token) {
        return res.status(400).send('No access token provided');
    }
    try{
        await validateGithubAuthToken(access_token);
    } catch (error: any) {
        res.status(401).json(error.message);
        return;
    }
    const userData = await getPrivateGitHubUserData(access_token);
    res.status(200).json(userData);
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

export const revokeGithubAuth = async (access_token: string) => {
    try{
        await validateGithubAuthToken(access_token);
    } catch (error: any) {
        throw new Error("Unable to validate auth token");
    }
    try {
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
                access_token: access_token
            })
        });
        if(!response.ok){
            throw new Error("Unable to revoke access token");
        }
    } catch (error:any) {
        throw new Error("Unable to revoke access token");
    }
}


export const getUsersEntities = async (userId: UserId) => {
    try {
        const projectMemberships = await getMembershipRecordsForUser(userId, EntityType.PROJECT) ?? [];
        const orgMemberships = await getMembershipRecordsForUser(userId, EntityType.ORG) ?? [];

        const projects = (await Promise.all(projectMemberships.map(async (p)=>{
            return getProjectById(p.entityId);
        }))).filter(p=>!!p);

        const organizations = (await Promise.all(orgMemberships.map(async (o)=>{
            return getOrgById(o.entityId);
        }))).filter(o=>!!o);

        return {projects, organizations}
    } catch (e) {
        console.error(e);
        throw e;
    }
}