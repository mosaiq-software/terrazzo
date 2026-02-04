'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Organizations', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.INTEGER
      },
      logoUrl: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      ownerId: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Organizations');
  }
};