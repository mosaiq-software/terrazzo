'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // NOTE: This migration assumes the previous schema where module-specific tables exist:
        // - Boards(id, boardCode)
        // - Documents(id, textBlockId, lastModifiedAt, lastModifiedByUserId)
        // - Directories(id)
        // and Modules has the shared module header fields.

        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 1) Add the new data column.
            // SQLite cannot add a NOT NULL column without a default, so we add it as NOT NULL with default '{}'.
            await queryInterface.addColumn(
                'Modules',
                'data',
                {
                    type: Sequelize.JSON,
                    allowNull: false,
                    defaultValue: '{}',
                },
                { transaction }
            );

            // 2) Backfill from the old tables into Modules.data (SQLite-safe SQL)
            // Boards -> Modules.data = { boardCode }
            await queryInterface.sequelize.query(
                `UPDATE "Modules"
                 SET "data" = (
                    SELECT json_object('boardCode', "Boards"."boardCode")
                    FROM "Boards"
                    WHERE "Boards"."id" = "Modules"."id"
                 )
                 WHERE EXISTS (
                    SELECT 1 FROM "Boards" WHERE "Boards"."id" = "Modules"."id"
                 );`,
                { transaction }
            );

            // Documents -> Modules.data = { textBlockId, lastModifiedAt, lastModifiedByUserId }
            await queryInterface.sequelize.query(
                `UPDATE "Modules"
                 SET "data" = (
                    SELECT json_object(
                        'textBlockId', "Documents"."textBlockId",
                        'lastModifiedAt', "Documents"."lastModifiedAt",
                        'lastModifiedByUserId', "Documents"."lastModifiedByUserId"
                    )
                    FROM "Documents"
                    WHERE "Documents"."id" = "Modules"."id"
                 )
                 WHERE EXISTS (
                    SELECT 1 FROM "Documents" WHERE "Documents"."id" = "Modules"."id"
                 );`,
                { transaction }
            );

            // 4) Drop the old module-specific tables
            await queryInterface.dropTable('Boards', { transaction });
            await queryInterface.dropTable('Documents', { transaction });
            await queryInterface.dropTable('Directories', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 1) Recreate the old tables (matching the state prior to this migration)
            await queryInterface.createTable(
                'Boards',
                {
                    id: {
                        type: Sequelize.STRING,
                        primaryKey: true,
                    },
                    boardCode: {
                        type: Sequelize.STRING,
                    },
                },
                { transaction }
            );

            await queryInterface.createTable(
                'Documents',
                {
                    id: {
                        type: Sequelize.STRING,
                        primaryKey: true,
                    },
                    textBlockId: {
                        type: Sequelize.STRING,
                    },
                    lastModifiedAt: {
                        type: Sequelize.INTEGER,
                    },
                    lastModifiedByUserId: {
                        type: Sequelize.STRING,
                    },
                },
                { transaction }
            );

            await queryInterface.createTable(
                'Directories',
                {
                    id: {
                        type: Sequelize.STRING,
                        primaryKey: true,
                    },
                },
                { transaction }
            );

            // 2) Move data out of Modules.data back into the appropriate tables
            await queryInterface.sequelize.query(
                `INSERT INTO "Boards" ("id", "boardCode")
                 SELECT "Modules"."id", json_extract("Modules"."data", '$.boardCode')
                 FROM "Modules"
                 WHERE "Modules"."type" = 'board';`,
                { transaction }
            );

            await queryInterface.sequelize.query(
                `INSERT INTO "Documents" ("id", "textBlockId", "lastModifiedAt", "lastModifiedByUserId")
                 SELECT
                    "Modules"."id",
                    json_extract("Modules"."data", '$.textBlockId'),
                    CAST(json_extract("Modules"."data", '$.lastModifiedAt') AS INTEGER),
                    json_extract("Modules"."data", '$.lastModifiedByUserId')
                 FROM "Modules"
                 WHERE "Modules"."type" = 'document';`,
                { transaction }
            );

            await queryInterface.sequelize.query(
                `INSERT INTO "Directories" ("id")
                 SELECT "Modules"."id"
                 FROM "Modules"
                 WHERE "Modules"."type" = 'directory';`,
                { transaction }
            );

            // 3) Remove the data column from Modules
            await queryInterface.removeColumn('Modules', 'data', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
