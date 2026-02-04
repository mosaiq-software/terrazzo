'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Lists', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      boardId: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      archived: {
        type: Sequelize.BOOLEAN
      },
      order: {
        type: Sequelize.INTEGER
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Lists');
  }
};