import express from 'express';
import cors from 'cors';

import boardRoutes from './routes/boardRoutes';
import userRoutes from './routes/userRoutes';
import textBlockRoutes from './routes/textBlockRoutes';

export const initApp = async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.set('trust proxy', true)

    app.get('/health', (req, res) => {
        res.send('Welcome to the TRZ API');
    });

    app.use('/board', boardRoutes);
    app.use('/user', userRoutes);
    app.use('/text', textBlockRoutes)

    return app;
}