import express from 'express';
import cors from 'cors';

export const initAdminServer = async () => {
    const socketAdminServer = express();
    socketAdminServer.use(cors());
    socketAdminServer.use(express.json());
    socketAdminServer.use(express.urlencoded({ extended: true }));
    socketAdminServer.set('trust proxy', true);

    socketAdminServer.use(express.static('admin-ui'));

    return socketAdminServer;
};
