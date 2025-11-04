import { Sequelize } from 'sequelize';
export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${process.env.DATABASE_PATH}/trz.sqlite`,
    logging: process.env.DATABASE_LOGGING === 'true',
});

sequelize
    .sync({ alter: false })
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((error) => {
        console.error('Error creating database or tables:', error);
    });
