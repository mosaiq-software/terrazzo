import express from 'express';
import cors from 'cors';
import routes from './routes/routes';

export const initApp = async () => {
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '512mb' }));
    app.use(express.urlencoded({ limit: '512mb', extended: true }));
    app.set('trust proxy', true);
    app.use(routes);

    return app;
};
