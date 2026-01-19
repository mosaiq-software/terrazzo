'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invites', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      forOrganizationId: {
        type: Sequelize.STRING
      },
      maxUses: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      uses: {
        type: Sequelize.INTEGER
      },
      createdById: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.STRING
      },
      revokedAt: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Invites');
  }
};