import fs from 'node:fs';
import { createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

interface CacheConfig {
    host: string;
    port: number;
    enabled: boolean;
    ttl: number;
}

const CONNECTION_FAILURE_COOLDOWN_MS = 1000 * 30;
const DEFAULT_TTL_SECONDS = 3600;
const REDIS_PORT = 6379;

const isRunningInDocker = (): boolean => {
    try {
        return fs.existsSync('/.dockerenv');
    } catch {
        return false;
    }
};

/**
 * Singleton Redis cache client manager.
 * Handles connection lifecycle, circuit breaker pattern, and graceful failure.
 */
class RedisCacheManager {
    private static instance: RedisCacheManager;
    private redisClient: RedisClient | null = null;
    private isConnecting = false;
    private connectionFailedAt: number | null = null; // Circuit breaker flag
    private readonly config: CacheConfig;

    private constructor() {
        this.config = {
            // No env vars: Redis is always enabled, with a fixed 1h TTL.
            // Host selection:
            // - inside Docker: use the compose service DNS name `redis`
            // - outside Docker (local dev): use localhost to connect to a locally exposed Redis
            host: isRunningInDocker() ? 'redis' : 'localhost',
            port: REDIS_PORT,
            enabled: true,
            ttl: DEFAULT_TTL_SECONDS,
        };
    }

    /**
     * Get the singleton instance of the RedisCacheManager.
     */
    public static getInstance(): RedisCacheManager {
        if (!RedisCacheManager.instance) {
            RedisCacheManager.instance = new RedisCacheManager();
        }
        return RedisCacheManager.instance;
    }

    public getConfig(): Readonly<CacheConfig> {
        return this.config;
    }

    /**
     * Check if we can attempt to connect to Redis.
     */
    private canConnect(): boolean {
        if (!this.config.enabled) {
            return false;
        }
        if (this.connectionFailedAt) {
            const now = Date.now();
            if (now - this.connectionFailedAt < CONNECTION_FAILURE_COOLDOWN_MS) {
                return false; // Still in cooldown period
            }
            // Reset after cooldown
            this.connectionFailedAt = null;
            this.purgeCache();
        }
        return true;
    }

    /**
     * Invalidate all cache entries.
     * This should be used after connection to redis has been lost as it likely has lots of stale data.
     */
    private purgeCache(): void {
        if (!this.redisClient) return;
        this.redisClient
            .flushAll()
            .then(() => {
                console.log('Cache nuked: all entries invalidated.');
            })
            .catch((err) => {
                console.error('Failed to nuke cache:', err.message);
            });
    }

    /**
     * Get or initialize the Redis client.
     * Handles connection failures gracefully - if Redis is unavailable, caching is disabled.
     * Circuit breaker: After a failed connection attempt, immediately returns null for subsequent calls.
     */
    public async getClient(): Promise<RedisClient | null> {
        if (!this.canConnect()) {
            return null;
        }

        if (this.redisClient?.isOpen) {
            return this.redisClient;
        }

        if (this.isConnecting) {
            // Wait for existing connection attempt
            await new Promise((resolve) => setTimeout(resolve, 100));
            return this.redisClient?.isOpen ? this.redisClient : null;
        }

        try {
            this.isConnecting = true;

            this.redisClient = createClient({
                socket: {
                    host: this.config.host,
                    port: this.config.port,
                    connectTimeout: 1000,
                    reconnectStrategy: () => {
                        // Don't reconnect - fail fast if Redis is unavailable
                        console.warn('Redis connection failed. Caching disabled.');
                        this.connectionFailedAt = Date.now();
                        return false;
                    },
                },
            });

            this.redisClient.on('error', (err) => {
                console.error('Redis client error:', err.message);
            });

            this.redisClient.on('connect', () => {
                console.log('Redis cache connected.');
            });

            this.redisClient.on('reconnecting', () => {
                console.log('Redis cache reconnecting...');
            });

            await this.redisClient.connect();

            return this.redisClient;
        } catch (error) {
            console.error('Failed to connect to Redis:', error instanceof Error ? error.message : error);
            console.warn('Caching disabled for this process. Restart to retry Redis connection.');
            this.connectionFailedAt = Date.now(); // Circuit breaker engaged
            this.redisClient = null;
            return null;
        } finally {
            this.isConnecting = false;
        }
    }

    /**
     * Close the Redis connection (useful for testing and graceful shutdown).
     */
    public async close(): Promise<void> {
        if (this.redisClient?.isOpen) {
            await this.redisClient.quit();
            this.redisClient = null;
        }

        // Reset circuit breaker on explicit close
        this.connectionFailedAt = null;
    }
}

// Export singleton instance and backward-compatible functions
const cacheManager = RedisCacheManager.getInstance();

export const cacheConfig = cacheManager.getConfig();
export const getRedisClient = () => cacheManager.getClient();
export const closeRedisClient = () => cacheManager.close();
export { RedisCacheManager };
