'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Labels', {
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
      color: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Labels');
  }
};