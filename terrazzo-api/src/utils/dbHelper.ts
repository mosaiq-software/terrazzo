import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
dotenv.config({ path: '../.env' });

const localVolumePath = process.env.LOCAL_VOLUME_PATH || '';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${localVolumePath}/db/terrazzo.sqlite`,
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
