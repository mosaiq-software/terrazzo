import type { BoardModelType } from '../models/boardModel';
import type { CardModelType } from '../models/cardModel';
import type { ModuleModelType } from '../models/moduleModel';
import type { UserModelType } from '../models/userModel';

/**
 * Enum of all cacheable entity types.
 * Add new entities here as they become cacheable.
 */
export enum CacheEntity {
    User = 'user',
    Board = 'board',
    Card = 'card',
    Module = 'module',
}

/**
 * Type mapping from cache entity to its corresponding data type.
 * This enables type-safe cache operations without explicit type assertions.
 * Maps to the actual model types as defined in the database models.
 */
export interface CacheEntityTypeMap {
    [CacheEntity.User]: UserModelType;
    [CacheEntity.Board]: BoardModelType;
    [CacheEntity.Card]: CardModelType;
    [CacheEntity.Module]: ModuleModelType;
}

/**
 * Infer the data type for a given cache entity.
 */
export type CacheEntityType<E extends CacheEntity> = CacheEntityTypeMap[E];
