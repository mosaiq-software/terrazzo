'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Files', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      base64: {
        type: Sequelize.TEXT
      },
      fileName: {
        type: Sequelize.STRING
      },
      mimeType: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.BIGINT
      },
      createdByUserId: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Files');
  }
};