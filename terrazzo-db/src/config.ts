import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const volumePath = process.env.VOLUME_PATH || '';
const dbPath = `${volumePath}/db/terrazzo.sqlite`;
const dbLogging = process.env.DATABASE_LOGGING === 'true';

const config = {
    development: {
        dialect: 'sqlite' as const,
        storage: dbPath,
        logging: dbLogging,
        dialectOptions: {},
    },
    production: {
        dialect: 'sqlite' as const,
        storage: dbPath,
        logging: dbLogging,
        dialectOptions: {},
    },
};

export default config;

// CommonJS compatibility for sequelize-cli
module.exports = config;
module.exports.default = config;
