'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrganizationMemberships', {
      userId: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      orgId: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      joinedAt: {
        type: Sequelize.BIGINT,
        allowNull: false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrganizationMemberships');
  }
};