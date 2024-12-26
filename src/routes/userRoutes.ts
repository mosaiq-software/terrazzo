import { githubLogin } from '@trz-api/controllers/userController';
import express from 'express';

const router = express.Router();

router.get('/githubLogin', (req, res) => {
    try {
        githubLogin(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});


export default router;