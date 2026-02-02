'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Boards', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            boardCode: {
                type: Sequelize.STRING
            },
            totalCards: {
                type: Sequelize.INTEGER
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Boards');
    }
};