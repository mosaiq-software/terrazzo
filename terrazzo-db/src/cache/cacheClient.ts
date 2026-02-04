import process from 'node:process';
import { createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let isConnecting = false;

interface CacheConfig {
    host: string;
    port: number;
    enabled: boolean;
    ttl: number;
}

export const cacheConfig: CacheConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
};

/**
 * Initialize and return the Redis client.
 * Handles connection failures gracefully - if Redis is unavailable, caching is disabled.
 */
export const getRedisClient = async (): Promise<RedisClient | null> => {
    if (!cacheConfig.enabled) {
        return null;
    }

    if (redisClient?.isOpen) {
        return redisClient;
    }

    if (isConnecting) {
        // Wait for existing connection attempt
        await new Promise((resolve) => setTimeout(resolve, 100));
        return redisClient?.isOpen ? redisClient : null;
    }

    try {
        isConnecting = true;

        redisClient = createClient({
            socket: {
                host: cacheConfig.host,
                port: cacheConfig.port,
                connectTimeout: 1000,
                reconnectStrategy: () => {
                    // Don't reconnect - fail fast if Redis is unavailable
                    console.warn('Redis connection failed. Caching disabled.');
                    return false;
                },
            },
        });

        redisClient.on('error', (err) => {
            console.error('Redis client error:', err.message);
        });

        redisClient.on('connect', () => {
            console.log('Redis cache connected.');
        });

        redisClient.on('reconnecting', () => {
            console.log('Redis cache reconnecting...');
        });

        await redisClient.connect();

        return redisClient;
    } catch (error) {
        console.error('Failed to connect to Redis:', error instanceof Error ? error.message : error);
        redisClient = null;
        return null;
    } finally {
        isConnecting = false;
    }
};

/**
 * Close the Redis connection (useful for testing and graceful shutdown).
 */
export const closeRedisClient = async (): Promise<void> => {
    if (redisClient?.isOpen) {
        await redisClient.quit();
        redisClient = null;
    }
};
