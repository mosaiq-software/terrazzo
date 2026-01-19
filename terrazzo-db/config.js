const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const dbDir = process.env.DATABASE_DIR;
const dbName = process.env.DATABASE_NAME;
const dbLogging = process.env.DATABASE_LOGGING === 'true';

if (!dbDir) {
    throw new Error('DATABASE_DIR environment variable is not set.');
}

if (!dbName) {
    throw new Error('DATABASE_NAME environment variable is not set.');
}

const sqliteStorage = `${dbDir}/${dbName}`;

module.exports = {
    development: {
        dialect: 'sqlite',
        storage: sqliteStorage,
        logging: dbLogging,
        dialectOptions: {},
    },
    production: {
        dialect: 'sqlite',
        storage: sqliteStorage,
        logging: dbLogging,
        dialectOptions: {},
    },
};