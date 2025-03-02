import { checkUsernameTaken, getOrCreateUserByGithubAccessToken, setupUser } from '@trz-api/controllers/userController';
import { githubAuth, revokeGithubAuth } from '@trz-api/utils/githubUtils';
import {RestRequestBody, RestRequestParams, RestResponse, RestResponseTypes, RestRoutes} from "@mosaiq/terrazzo-common/apiTypes";
import express from 'express';
import { UserId } from '@mosaiq/terrazzo-common/types';

const router = express.Router();

router.get(RestRoutes.INDEX, async (req, res) => {
    const params: RestRequestParams[RestRoutes.INDEX] = req.params;
    const body: RestRequestBody[RestRoutes.INDEX] = req.body;
    try {
        const response: RestResponse<RestRoutes.INDEX> = 'Welcome to the TRZ API';
        res.send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.get(RestRoutes.USER_GITHUB_AUTH, async (req, res) => {
    const params: RestRequestParams[RestRoutes.USER_GITHUB_AUTH] = req.params;
    const body: RestRequestBody[RestRoutes.USER_GITHUB_AUTH] = req.body;
    try {
        if(!params.code){
            throw new Error("No code!")
        }
        const token = await githubAuth(params.code);
        const response: RestResponse<RestRoutes.USER_GITHUB_AUTH> = token;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.get(RestRoutes.USER_GITHUB_DATA, async (req, res) => {
    const params: RestRequestParams[RestRoutes.USER_GITHUB_DATA] = req.params;
    const body: RestRequestBody[RestRoutes.USER_GITHUB_DATA] = req.body;
    try {
        if(!params.access_token){
            throw new Error("No token!")
        }
        const userHeader = await getOrCreateUserByGithubAccessToken(params.access_token);
        const response: RestResponse<RestRoutes.USER_GITHUB_DATA> = userHeader;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.delete(RestRoutes.USER_GITHUB_REVOKE_TOKEN, async (req, res) => {
    const params: RestRequestParams[RestRoutes.USER_GITHUB_REVOKE_TOKEN] = req.params;
    const body: RestRequestBody[RestRoutes.USER_GITHUB_REVOKE_TOKEN] = req.body;
    try {
        if(!req.params.accessToken){
            res.status(400).send("No access token provided");
            return;
        }
        await revokeGithubAuth(req.params.accessToken);
        const response: RestResponse<RestRoutes.USER_GITHUB_REVOKE_TOKEN> = undefined;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.get(RestRoutes.USER_CHECK_USERNAME, async (req, res) => {
    const params: RestRequestParams[RestRoutes.USER_CHECK_USERNAME] = req.params;
    const body: RestRequestBody[RestRoutes.USER_CHECK_USERNAME] = req.body;
    try {
        if(!req.params.username) {
            res.status(400).send("No username provided");
            return;
        }
        const taken = await checkUsernameTaken(req.params.username);
        const response: RestResponse<RestRoutes.USER_CHECK_USERNAME> = taken;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.post(RestRoutes.USER_SETUP, async (req, res) => {
    const params: RestRequestParams[RestRoutes.USER_SETUP] = req.params;
    const body: RestRequestBody[RestRoutes.USER_SETUP] = req.body;
    try {
        if(!body.username || !body.firstName || !body.lastName || !params.id) {
            res.status(400).send("Missing info");
            return;
        }
        const user = await setupUser(params.id as UserId, body.username, body.firstName, body.lastName);
        const response: RestResponse<RestRoutes.USER_SETUP> = user;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

export default router;