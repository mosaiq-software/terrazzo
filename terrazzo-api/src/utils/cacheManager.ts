import { createClient, RedisClientType } from 'redis';

export class CacheManager {
    private static instance: CacheManager | null = null;
    private client: RedisClientType | null = null;
    private connecting: Promise<RedisClientType> | null = null;

    private constructor() {}

    public static getInstance() {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    private getRedisUrl() {
        const port = parseInt(process.env.REDIS_PORT || '6379', 10);
        const host = process.env.REDIS_HOST || 'localhost';
        return process.env.REDIS_URL || `redis://${host}:${port}`;
    }

    private async getRedisClient() {
        if (this.client?.isOpen) {
            return this.client;
        }
        if (!this.connecting) {
            this.client = createClient({ url: this.getRedisUrl() });
            this.client.on('error', (error) => {
                console.error('Redis client error:', error);
            });
            this.connecting = this.client.connect().then(() => {
                if (!this.client) {
                    throw new Error('Redis client was not initialized');
                }
                return this.client;
            });
        }
        return this.connecting;
    }

    public async get<T>(key: string): Promise<T | null> {
        try {
            const client = await this.getRedisClient();
            const cached = await client.get(key);
            if (!cached) {
                return null;
            }
            return JSON.parse(cached) as T;
        } catch (error) {
            console.warn('Redis get failed:', error);
            return null;
        }
    }

    public async set<T>(key: string, value: T, ttlSeconds?: number) {
        try {
            const client = await this.getRedisClient();
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await client.set(key, serialized, {
                    expiration: {
                        type: 'EX',
                        value: ttlSeconds,
                    },
                });
            } else {
                await client.set(key, serialized);
            }
        } catch (error) {
            console.warn('Redis set failed:', error);
        }
    }

    public async del(key: string) {
        try {
            const client = await this.getRedisClient();
            await client.del(key);
        } catch (error) {
            console.warn('Redis del failed:', error);
        }
    }
}
