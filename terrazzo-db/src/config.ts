import { isRunningInDocker } from './utils';

const volumePath = (process.env.VOLUME_PATH || '').replace(/\/+$/, '');
const localDbPath = `${volumePath}/db/terrazzo.sqlite`;
const dockerDbPath = '/db/terrazzo.sqlite';
const dbPath = isRunningInDocker() ? dockerDbPath : localDbPath;
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
