import { CacheEntity } from './cacheTypes';

/**
 * Generate a cache key for a specific entity.
 * Pattern: {entity}:{id}
 * Examples: user:123, board:abc-def, card:xyz-123
 */
export const makeCacheKey = (entity: CacheEntity, id: string | number): string => {
    return `${entity}:${id}`;
};

/**
 * Generate a cache key pattern for matching multiple keys.
 * Pattern: {entity}:{pattern}
 * Examples: card:board:abc-def:*, list:*
 */
export const makeCachePattern = (entity: CacheEntity, pattern: string = '*'): string => {
    return `${entity}:${pattern}`;
};

/**
 * Parse entity and ID from a cache key.
 */
export const parseCacheKey = (key: string): { entity: string; id: string } | null => {
    const parts = key.split(':');
    if (parts.length < 2) return null;
    return {
        entity: parts[0],
        id: parts.slice(1).join(':'),
    };
};
