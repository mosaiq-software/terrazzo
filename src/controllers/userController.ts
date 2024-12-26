import axios from "axios";
import { Request, Response } from "express";
import queryString from "query-string";

export const githubLogin = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
        return res.status(400).send('No code provided');
    }
    const access_token = await getAccessTokenFromCode(code);
    if (!access_token) {
        return res.status(400).send('Invalid code');
    }
    const userData = await getGitHubUserData(access_token);
    res.json(userData);
    
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

async function getGitHubUserData(access_token: string) {
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