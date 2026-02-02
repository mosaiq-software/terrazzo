import { recordKeys } from '@mosaiq/terrazzo-common';
import process from 'node:process';
import { Sequelize } from 'sequelize';
import configs from '../config';
import { Db, DbModel } from '../dbTypes';
import { CardModel } from './card';

const env = process.env.TRZ_ENV || 'development';
const volumePath = process.env.VOLUME_PATH || '';

const config = configs[env];
if (!config) {
    throw new Error(`Database config for environment "${env}" was not found`);
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${volumePath}/db/terrazzo.sqlite`,
    logging: process.env.DATABASE_LOGGING === 'true',
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established.');
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });

const models: Record<string, DbModel> = {
    Card: CardModel(sequelize),
};

const db: Db = {
    sequelize,
    Sequelize,
    ...models,
};

recordKeys(models).forEach((modelName) => {
    const model = models[modelName];
    if (model.associate) {
        model.associate(db);
    }
});

export default db;
