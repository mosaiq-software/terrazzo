'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Cards', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            listId: {
                type: Sequelize.STRING,
                allowNull: true
            },
            boardId: {
                type: Sequelize.STRING
            },
            cardNumber: {
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            descriptionTextBlockId: {
                type: Sequelize.STRING
            },
            priority: {
                type: Sequelize.INTEGER
            },
            storyPoints: {
                type: Sequelize.INTEGER
            },
            archived: {
                type: Sequelize.BOOLEAN
            },
            order: {
                type: Sequelize.INTEGER
            },
            createdById: {
                type: Sequelize.STRING
            },
            createdAt: {
                type: Sequelize.INTEGER
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Cards');
    }
};