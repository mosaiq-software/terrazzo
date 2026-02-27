'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('CardAssignments', 'id');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('CardAssignments', 'id', {
            type: Sequelize.STRING,
            primaryKey: true,
        });
    },
};
