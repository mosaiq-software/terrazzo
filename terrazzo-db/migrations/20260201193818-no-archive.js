'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Cards', 'order', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.changeColumn('Lists', 'order', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        // If a row has archived=true, set order to null
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.sequelize.query(`
                UPDATE "Cards"
                SET "order" = NULL
                WHERE "archived" = TRUE
            `, { transaction });

            await queryInterface.sequelize.query(`
                UPDATE "Lists"
                SET "order" = NULL
                WHERE "archived" = TRUE
            `, { transaction });
        });

        // Now remove the columns
        await queryInterface.removeColumn('Cards', 'archived');
        await queryInterface.removeColumn('Cards', 'storyPoints');
        await queryInterface.removeColumn('Lists', 'archived');
    },

    async down(queryInterface, Sequelize) {
        // Add the columns back, setting archived to false by default, and true if order is null
        await queryInterface.addColumn('Cards', 'archived', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        await queryInterface.addColumn('Cards', 'storyPoints', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.addColumn('Lists', 'archived', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.sequelize.query(`
                UPDATE "Cards"
                SET "archived" = TRUE
                WHERE "order" IS NULL
            `, { transaction });

            await queryInterface.sequelize.query(`
                UPDATE "Lists"
                SET "archived" = TRUE
                WHERE "order" IS NULL
            `, { transaction });
        });
    }
};
