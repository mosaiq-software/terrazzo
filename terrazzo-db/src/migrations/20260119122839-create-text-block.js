'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TextBlocks', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      text: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.STRING
      },
      trackHistory: {
        type: Sequelize.BOOLEAN
      },
      lastSnapshotAt: {
        type: Sequelize.INTEGER
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TextBlocks');
  }
};