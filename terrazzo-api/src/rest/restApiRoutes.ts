import { RestRequestBody, RestRequestParams, RestResponse, RestRoutes } from '@mosaiq/terrazzo-common';
import { createTerrazzoBoardFromTrelloBoard } from '@trz-api/controllers/boardController';
import { checkUsernameTaken, DEV_upsertFakeUser, getOrCreateUserByGithubAccessToken } from '@trz-api/controllers/userController';
import { isDev } from '@trz-api/utils/envUtils';
import { githubAuth, revokeGithubAuth } from '@trz-api/utils/githubUtils';
import express from 'express';

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
        if (!params.code) {
            throw new Error('No code!');
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
        if (!params.access_token) {
            throw new Error('No token!');
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
        if (!req.params.accessToken) {
            res.status(400).send('No access token provided');
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
        if (!req.params.username) {
            res.status(400).send('No username provided');
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

router.post(RestRoutes.USER_FAKE_DEV, async (req, res) => {
    const params: RestRequestParams[RestRoutes.USER_FAKE_DEV] = req.params;
    try {
        if (!isDev()) {
            res.sendStatus(401);
        }
        const fakeUser = await DEV_upsertFakeUser(params.username);
        const response: RestResponse<RestRoutes.USER_FAKE_DEV> = fakeUser;
        res.status(200).send(response);
    } catch (e: any) {
        console.error(e);
        res.status(500).send('Internal server error');
    }
});

router.post(RestRoutes.IMPORT_FROM_TRELLO, async (req, res) => {
    const params: RestRequestParams[RestRoutes.IMPORT_FROM_TRELLO] = req.params as RestRequestParams[RestRoutes.IMPORT_FROM_TRELLO];
    const body: RestRequestBody[RestRoutes.IMPORT_FROM_TRELLO] = req.body;
    try {
        const boardId = await createTerrazzoBoardFromTrelloBoard(params.parentId, body);
        res.status(200).send(boardId);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

export default router;
