import { githubAuth, githubUserData } from '@trz-api/controllers/userController';
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


export default router;