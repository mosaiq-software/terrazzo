import { cacheConfig, getRedisClient } from './cacheClientManager';
import { makeCacheKey, makeCachePattern } from './cacheKeys';
import { CacheEntity, CacheEntityType } from './cacheTypes';

/**
 * Get a value from cache, or execute fallback function and cache the result.
 * This is the primary method to use for read-through caching.
 * The return type is automatically inferred based on the cache entity type.
 *
 * @param entity - Entity type (e.g., CacheEntity.User, CacheEntity.Board)
 * @param id - Entity ID
 * @param fallback - Function to execute if cache miss (typically a DB query)
 * @param ttl - Optional TTL in seconds (defaults to config value)
 * @returns The cached or freshly fetched value with proper typing
 */
export const getCached = async <E extends CacheEntity>(
    entity: E,
    id: string | number,
    fallback: () => Promise<CacheEntityType<E> | null | undefined>,
    ttl?: number
): Promise<CacheEntityType<E> | null | undefined> => {
    const key = makeCacheKey(entity, id);

    try {
        const client = await getRedisClient();
        if (!client) {
            // Cache unavailable, use fallback directly
            console.debug(`Cache disabled, executing fallback for key ${key}`);
            return await fallback();
        }

        // Try to get from cache
        const cached = await client.get(key);
        if (cached !== null) {
            try {
                console.debug(`Cache hit for key ${key}`);
                return JSON.parse(cached) as CacheEntityType<E>;
            } catch (parseError) {
                console.error(`Failed to parse cached value for key ${key}:`, parseError);
                // Fall through to fetch fresh data
            }
        }

        // Cache miss - execute fallback
        console.debug(`Cache miss for key ${key}, executing fallback`);
        const value = await fallback();

        // Cache the result (including null to prevent repeated queries for non-existent records)
        if (value !== undefined && value !== null) {
            await setCache(entity, id, value, ttl);
        }

        return value;
    } catch (error) {
        console.error(`Cache error for key ${key}:`, error instanceof Error ? error.message : error);
        // On cache error, fall back to direct DB query
        return await fallback();
    }
};

/**
 * Set a value in the cache explicitly.
 *
 * @param entity - Entity type
 * @param id - Entity ID
 * @param value - Value to cache (will be JSON serialized)
 * @param ttl - Optional TTL in seconds (defaults to config value)
 */
export const setCache = async <E extends CacheEntity>(
    entity: E,
    id: string | number,
    value: CacheEntityType<E>,
    ttl: number = cacheConfig.ttl
): Promise<void> => {
    const key = makeCacheKey(entity, id);

    try {
        const client = await getRedisClient();
        if (!client) return;

        const serialized = JSON.stringify(value);
        await client.setEx(key, ttl, serialized);
        console.debug(`Cache set for key ${key} with TTL ${ttl} seconds`);
    } catch (error) {
        console.error(`Failed to set cache for key ${key}:`, error instanceof Error ? error.message : error);
    }
};

/**
 * Invalidate (delete) a specific cache entry.
 * Call this after update or delete operations.
 *
 * @param entity - Entity type
 * @param id - Entity ID
 */
export const invalidateCache = async (entity: CacheEntity, id: string | number): Promise<void> => {
    const key = makeCacheKey(entity, id);

    try {
        const client = await getRedisClient();
        if (!client) return;

        await client.del(key);
        console.debug(`Invalidated cache for key ${key}`);
    } catch (error) {
        console.error(`Failed to invalidate cache for key ${key}:`, error instanceof Error ? error.message : error);
    }
};

/**
 * Invalidate multiple cache entries matching a pattern.
 * Useful for clearing related entities (e.g., all cards for a board).
 *
 * @param entity - Entity type
 * @param pattern - Pattern to match (e.g., 'board:123:*')
 */
export const invalidatePattern = async (entity: CacheEntity, pattern: string = '*'): Promise<void> => {
    const keyPattern = makeCachePattern(entity, pattern);

    try {
        const client = await getRedisClient();
        if (!client) return;

        // Scan for keys matching the pattern
        const keys: string[] = [];
        for await (const key of client.scanIterator({ MATCH: keyPattern, COUNT: 100 })) {
            keys.push(key);
        }

        if (keys.length > 0) {
            await client.del(keys);
            console.log(`Invalidated ${keys.length} cache entries matching pattern: ${keyPattern}`);
        }
    } catch (error) {
        console.error(
            `Failed to invalidate cache pattern ${keyPattern}:`,
            error instanceof Error ? error.message : error
        );
    }
};

/**
 * Convenience wrapper that caches the result of a function call.
 * Useful for wrapping existing functions without modifying their internals.
 * The return type is automatically inferred based on the cache entity type.
 *
 * @param entity - Entity type
 * @param id - Entity ID
 * @param fn - Function to wrap
 * @param ttl - Optional TTL
 * @returns Wrapped function result
 */
export const withCache = async <E extends CacheEntity>(
    entity: E,
    id: string | number,
    fn: () => Promise<CacheEntityType<E>>,
    ttl?: number
): Promise<CacheEntityType<E>> => {
    return (await getCached(entity, id, fn, ttl)) as CacheEntityType<E>;
};
