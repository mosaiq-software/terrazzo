import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
dotenv.config({ path: '../.env' });

const volumePath = process.env.VOLUME_PATH || '';

export const sequelize = new Sequelize({
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
