import {Sequelize} from 'sequelize';
export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DATABASE_PATH ?? "./undefinedDatabase.sqlite",
    logging: (process.env.DATABASE_LOGGING === "true")
});