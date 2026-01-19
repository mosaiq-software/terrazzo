'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LinkedAccounts', {
      provider: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      accountId: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      userId: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      accountData: {
        type: Sequelize.JSON
      },
      privateAccountData: {
        type: Sequelize.JSON,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LinkedAccounts');
  }
};