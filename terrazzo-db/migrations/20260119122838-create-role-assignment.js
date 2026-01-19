'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RoleAssignments', {
      userId: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      roleId: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      orgId: {
        type: Sequelize.STRING,
        primaryKey: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RoleAssignments');
  }
};