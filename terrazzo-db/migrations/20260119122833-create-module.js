'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Modules', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      parentId: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      order: {
        type: Sequelize.INTEGER
      },
      archived: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        type: Sequelize.INTEGER
      },
      orgId: {
        type: Sequelize.STRING
      },
      desiredPermissions: {
        type: Sequelize.JSON
      },
      effectivePermissions: {
        type: Sequelize.JSON
      },
      public: {
        type: Sequelize.BOOLEAN
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Modules');
  }
};