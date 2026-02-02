'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Boards', 'totalCards');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('Boards', 'totalCards', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });

        // Set totalCards to the number of cards associated with each board
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.sequelize.query(`
        UPDATE "Boards" b
        SET "totalCards" = sub.count
        FROM (
          SELECT "boardId", COUNT(*) AS count
          FROM "Cards"
          GROUP BY "boardId"
        ) AS sub
        WHERE b.id = sub."boardId"
      `, { transaction });
        });
    }
};
