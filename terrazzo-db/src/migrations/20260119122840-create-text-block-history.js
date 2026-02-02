'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TextBlockHistories', {
      snapshotId: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      textBlockId: {
        type: Sequelize.STRING
      },
      timestamp: {
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.TEXT
      },
      tags: {
        type: Sequelize.JSON
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TextBlockHistories');
  }
};