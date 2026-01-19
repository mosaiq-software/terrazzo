'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('AuthSessions', {
            userId: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            authToken: {
                type: Sequelize.STRING
            },
            createdAt: {
                type: Sequelize.BIGINT
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('AuthSessions');
    }
};