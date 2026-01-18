import {
    LinkedAccountProvider,
    RestRequestBody,
    RestRequestParams,
    RestResponse,
    RestRoutes,
    SYSTEM_USER_ID,
} from '@mosaiq/terrazzo-common';
import {
    handleAuthProviderCallback,
    signInWithExistingAuth,
    startAuthenticatedSession,
} from '@trz-api/controllers/authController';
import { createTerrazzoBoardFromTrelloBoard } from '@trz-api/controllers/boardController/trelloImport';
import { createFile, getFile } from '@trz-api/controllers/fileController';
import { addLinkedAccountToUser } from '@trz-api/controllers/linkedAccountController';
import { DEV_upsertFakeUser } from '@trz-api/controllers/userController';
import { getLinkedAccountForProviderDb } from '@trz-api/persistence/linkedAccountPersistence';
import { isDev } from '@trz-api/utils/envUtils';
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

router.post(RestRoutes.USER_FAKE_DEV, async (req, res) => {
    const params: RestRequestParams[RestRoutes.USER_FAKE_DEV] = req.params;
    try {
        if (!isDev()) {
            res.sendStatus(401);
        }
        let linkedAccount = await getLinkedAccountForProviderDb(LinkedAccountProvider.DEV, params.username);
        if (!linkedAccount) {
            const fakeUser = await DEV_upsertFakeUser(params.username);
            linkedAccount = await addLinkedAccountToUser({
                provider: LinkedAccountProvider.DEV,
                accountId: fakeUser.username,
                userId: fakeUser.id,
                accountData: {},
                privateAccountData: {},
            });
        }
        const authSession = await startAuthenticatedSession(linkedAccount.userId);
        if (!authSession) {
            res.status(500).send('Failed to start auth session for fake user');
            return;
        }
        const response: RestResponse<RestRoutes.USER_FAKE_DEV> = authSession;
        res.status(200).send(response);
    } catch (e: any) {
        console.error(e);
        res.status(500).send('Internal server error');
    }
});

router.post(RestRoutes.IMPORT_FROM_TRELLO, async (req, res) => {
    const params: RestRequestParams[RestRoutes.IMPORT_FROM_TRELLO] =
        req.params as RestRequestParams[RestRoutes.IMPORT_FROM_TRELLO];
    const body: RestRequestBody[RestRoutes.IMPORT_FROM_TRELLO] = req.body;
    try {
        const boardId = await createTerrazzoBoardFromTrelloBoard(params.parentId, body.data, body.userMap);
        const response: RestResponse<RestRoutes.IMPORT_FROM_TRELLO> = boardId;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.get(RestRoutes.GET_FILE, async (req, res) => {
    const params: RestRequestParams[RestRoutes.GET_FILE] = req.params as RestRequestParams[RestRoutes.GET_FILE];
    try {
        if (!params.fileId) {
            res.status(400).send('No file ID provided');
            return;
        }
        const retrievedFile = await getFile(params.fileId);
        res.setHeader('Content-Type', retrievedFile?.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${retrievedFile?.fileName || 'file'}"`);
        const response: RestResponse<RestRoutes.GET_FILE> = retrievedFile.file;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.post(RestRoutes.UPLOAD_FILE, async (req, res) => {
    const body: RestRequestBody[RestRoutes.UPLOAD_FILE] = req.body;
    try {
        const uploadedFile = await createFile(body.base64, body.fileName, body.mimeType, SYSTEM_USER_ID);
        const response: RestResponse<RestRoutes.UPLOAD_FILE> = uploadedFile.id;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.post(RestRoutes.AUTH_PROVIDER_CALLBACK, async (req, res) => {
    const body: RestRequestBody[RestRoutes.AUTH_PROVIDER_CALLBACK] = req.body;
    try {
        const authSession = await handleAuthProviderCallback(body);
        if (!authSession) {
            res.status(500).send('Failed to sign in with auth provider');
            return;
        }
        const response: RestResponse<RestRoutes.AUTH_PROVIDER_CALLBACK> = authSession;
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.post(RestRoutes.EXISTING_AUTH, async (req, res) => {
    const body: RestRequestBody[RestRoutes.EXISTING_AUTH] = req.body;
    try {
        const authSession = await signInWithExistingAuth(body);
        const response: RestResponse<RestRoutes.EXISTING_AUTH> = authSession || 'unauthorized';
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

export default router;
