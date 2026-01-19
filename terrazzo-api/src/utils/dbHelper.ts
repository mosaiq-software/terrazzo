import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
dotenv.config({ path: '../.env' });

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${process.env.DATABASE_DIR}/${process.env.DATABASE_NAME}`,
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
