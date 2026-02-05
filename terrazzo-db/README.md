# Terrazzo DB

This package manages the database layer for Terrazzo, including models, migrations, caching, and database configuration.

## Overview

Terrazzo DB uses [Sequelize](https://sequelize.org/) as the ORM with SQLite as the database. The package is structured to support:

- **Models**: TypeScript model definitions with type safety
- **Migrations**: Sequelize CLI-managed database migrations (JavaScript)
- **Cache**: Redis-based caching layer
- **Seeders**: Development data seeding

## Migrations

### When to Create a Migration

Create a migration whenever you need to modify the database schema:

- Creating tables
- Modifying tables (adding, removing, or changing columns)
- Changing constraints (primary keys, foreign keys, indexes)
- Data migrations (transforming existing data)
- Removing tables

**Do NOT** create migrations for:
- Model-level changes that don't affect schema
- Configuration changes
- Cache layer modifications

### Creating a Migration

Use the npm script to generate a new migration:

```bash
npm run create-migration -- your-migration-name
```

This uses `sequelize-cli` to create a timestamped JavaScript file in `src/migrations/`:
```
YYYYMMDDHHMMSS-your-migration-name.js
```

The generated file will have this structure:

```javascript
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Your migration code here
    },
    async down(queryInterface, Sequelize) {
        // Rollback code here
    }
};
```

Implement the `up` method for applying changes and the `down` method for reverting them. Migrations remain as JavaScript files and are executed by sequelize-cli.

### Running Migrations

**Apply pending migrations**:
```bash
npm run migrate:up
```

**Rollback the last migration**:
```bash
npm run migrate:undo
```

**Rollback all migrations**:
```bash
npm run migrate:undo:all
```

## Models

Models are TypeScript files that define the structure and behavior of database entities. They provide type safety and are used by the application code (not by migrations).

### Creating a Model

1. **Create a model file** in `src/models/` named `{entityName}Model.ts`

2. **Define the model type** by importing the corresponding type from `@mosaiq/terrazzo-common`:

```typescript
import { SomeType } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type SomeModelType = SomeType;
// If no common type fits the model perfectly, a new interface can be exported here instead.
```

3. **Create a getter function** that returns a `DbModel`:

```typescript
export const getSomeModel = (sequelize: Sequelize): DbModel<SomeModelType> => {
    class SomeModel extends Model<SomeModelType> {
        static associate(db: Db) {
            // Define associations here if needed
        }
    }
    
    SomeModel.init(
        {
            // Define column schema matching migration
            aField: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            anotherField: DataTypes.STRING,
            createdAt: DataTypes.BIGINT,
        },
        { 
            sequelize, 
            timestamps: false, // Always set to false. Add a custom field for epoch time if needed.
            modelName: 'Some' 
        }
    );

    return SomeModel;
};
```

### Exporting Models in Index

After creating a model getter, add it to `src/models/index.ts`:
- Call the getter with the `sequelize` instance
- Add the model to all the exported models (pattern match)
- Export the model's type alongside others

## Caching
The caching layer uses Redis to store frequently accessed data. Models can implement caching logic as needed, typically in the persistence layer of the API.

## Development Workflow

### Creating a New Entity

1. Create migration: `npm run create-migration -- create-entity-name`
2. Define schema in the migration file (`up` and `down` methods)
3. Run migration: `npm run migrate:up`
4. Create TypeScript model in `src/models/entityNameModel.ts`
5. Import and add model to `src/models/index.ts`
6. Add type definition to `src/dbTypes.ts`
7. Use the new model in api's persistence layer as needed

### Modifying Existing Schema

1. Create migration: `npm run create-migration -- modify-entity-name`
2. Implement `up` and `down` methods
3. Run migration: `npm run migrate:up`
4. Update corresponding TypeScript model if needed

### Resetting Database (Development Only)

Use the root-level script to completely reset the database:

```bash
npm run reset:db
```

This will delete the SQLite database file and re-run all migrations from scratch.
