import { githubAuth, githubUserData, revokeGithubAuth } from '@trz-api/utils/githubUtils';
import express from 'express';

const router = express.Router();

router.get('/github/auth', (req, res) => {
    try {
        githubAuth(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.get('/github/userdata', (req, res) => {
    try {
        githubUserData(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.delete('/github/revoke/:accessToken', async (req, res) => {
    try {
        if(!req.params.accessToken){
            res.status(400).send("No access token provided");
            return;
        }
        await revokeGithubAuth(req.params.accessToken);
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});


export default router;