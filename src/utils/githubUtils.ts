import { GithubUserProfile, User } from "@mosaiq/terrazzo-common/types";
import axios from "axios";
import { Request, Response } from "express";
import queryString from "query-string";

export const githubAuth = async (code:string) => {
    if (!code) {
        throw new Error("No code provided");
    }
    const access_token = await getAccessTokenFromCode(code);
    if (!access_token) {
        throw new Error("Invalid code");
    }
    return access_token;
};

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

export async function getPrivateGitHubUserData(access_token: string): Promise<GithubUserProfile | null> {
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

export async function getPublicGithubUserDataFromGithubUserId(githubId: string): Promise<GithubUserProfile | null> {
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