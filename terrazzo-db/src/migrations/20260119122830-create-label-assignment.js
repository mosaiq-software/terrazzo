'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LabelAssignments', {
      labelId: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      cardId: {
        type: Sequelize.STRING,
        primaryKey: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LabelAssignments');
  }
};