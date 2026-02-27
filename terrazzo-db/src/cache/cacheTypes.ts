import type { FileModelType } from '../models/fileModel';

/**
 * Enum of all cacheable entity types.
 * Add new entities here as they become cacheable.
 */
export enum CacheEntity {
    // Data sources
    ObjectSource = 'objectSource',
    CollectionSource = 'collectionSource',

    // Custom
    File = 'file',
}

/**
 * Type mapping from cache entity to its corresponding data type.
 * This enables type-safe cache operations without explicit type assertions.
 * Maps to the actual model types as defined in the database models.
 */
export interface CacheEntityTypeMap {
    // Data sources
    [CacheEntity.ObjectSource]: any;
    [CacheEntity.CollectionSource]: any;

    // Custom
    [CacheEntity.File]: FileModelType;
}

/**
 * Infer the data type for a given cache entity.
 */
export type CacheEntityType<E extends CacheEntity> = CacheEntityTypeMap[E];
