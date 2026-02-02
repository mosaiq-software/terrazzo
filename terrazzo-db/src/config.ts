import dotenv from 'dotenv';
import { DbConfigs } from './dbTypes';
dotenv.config({ path: '../.env' });

const volumePath = process.env.VOLUME_PATH || '';
const dbPath = `${volumePath}/db/terrazzo.sqlite`;
const dbLogging = process.env.DATABASE_LOGGING === 'true';

const configs: DbConfigs = {
    development: {
        dialect: 'sqlite',
        storage: dbPath,
        logging: dbLogging,
        dialectOptions: {},
    },
    production: {
        dialect: 'sqlite',
        storage: dbPath,
        logging: dbLogging,
        dialectOptions: {},
    },
};

export default configs;
