const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const localVolumePath = process.env.LOCAL_VOLUME_PATH || '';
const dbPath = `${localVolumePath}/db/terrazzo.sqlite`;
const dbLogging = process.env.DATABASE_LOGGING === 'true';

module.exports = {
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