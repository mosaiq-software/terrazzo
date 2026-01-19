'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documents', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      textBlockId: {
        type: Sequelize.STRING
      },
      lastModifiedAt: {
        type: Sequelize.INTEGER
      },
      lastModifiedByUserId: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documents');
  }
};