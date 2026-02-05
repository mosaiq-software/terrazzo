# Terrazzo DB

This package manages the database layer for Terrazzo, including models, migrations, caching, and database configuration.

## Overview

Terrazzo DB uses [Sequelize](https://sequelize.org/) as the ORM with SQLite as the database. The package is structured to support:

- **Models**: TypeScript model definitions with type safety
- **Migrations**: Sequelize CLI-managed database migrations (only .js files, so be careful!)
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

The caching layer uses Redis to store frequently accessed data and reduce database load. Caching is implemented in the API's persistence layer, not directly in models.

### Architecture

The cache system is built on Redis with:
- **Type-safe keys**: Defined cache entity types with automatic type inference
- **Circuit breaker**: Automatic fallback when Redis is unavailable
- **TTL management**: Configurable expiration times
- **Pattern-based invalidation**: Bulk cache clearing for related entities

### Cache Keys

Cache keys follow a structured pattern for consistent access:

**Model Keys** (single entities):
```
{entity}:{id}
```
**Composite Keys** (collections):
```
{entity}:{compositePattern}
```
### When to Use Caching
> 99% of the time, only use caching in the API's persistence layer!

**Use caching for:**
- Frequently read entities (users, boards, cards)
- Data that changes infrequently
- Expensive queries or joins
- Collection queries (cards in a list, lists in a board)

**Do NOT cache:**
- Data that changes very frequently
- Large datasets or long lists of objects that won't fit in memory
- Sensitive data requiring strict consistency
- One-time queries

### Model Keys vs Composite Keys

**Model Keys**: Cache individual database records
- Use `CacheEntity.User`, `CacheEntity.Board`, `CacheEntity.Card`, etc.
- Store a single complete model object
- Invalidated when the specific entity is updated or deleted

**Composite Keys**: Cache collections of IDs or derived data
- Use `CacheEntity.CardsInList`, `CacheEntity.ListsInBoard`, etc.
- Store arrays of IDs or aggregated data
- Invalidated when relationships change

### Using the Cache
- Use `getCached` to automatically fetch from cache or database
- Use `setCache` after creating or updating entities
- Use `invalidateCache` after updates or deletes
- Use `invalidatePattern` to clear related entities

### Adding New Cacheable Entities

To make a new entity cacheable:

1. **Add to `CacheEntity` enum** in `src/cache/cacheTypes.ts`:
```typescript
export enum CacheEntity {
    // ...existing entities
    NewEntity = 'newEntity',
}
```

2. **Add type mapping** in `CacheEntityTypeMap`:
```typescript
export interface CacheEntityTypeMap {
    // ...existing mappings
    [CacheEntity.NewEntity]: NewEntityModelType;
}
```

3. **Use in persistence layer**: Implement caching in the API's persistence functions. Make sure to handle cache set, get, and invalidation as needed!

### Configuration

Cache behavior is controlled via environment variables:

- `REDIS_HOST`: Redis server hostname (default: `localhost`)
- `REDIS_PORT`: Redis server port (default: `6379`)
- `CACHE_ENABLED`: Enable caching (default: `true`)
- `CACHE_TTL`: Default TTL in seconds (default: `3600` = 1 hour)

### Cache Resilience

The cache layer includes automatic fallback:
- If Redis is unavailable, queries fall back to the database
- No application errors when cache fails
- Circuit breaker prevents repeated connection attempts
- All operations are wrapped in try-catch for safety

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
