// src/config/redis.ts

import { Redis, RedisOptions } from 'ioredis';
import { config } from './env.js';

let redisClient: Redis | null = null;
let isRedisConnected = false;

let hasLoggedNotice = false;

// Dedicated pub/sub connection pair for the Socket.IO Redis adapter. Kept
// separate from the shared cache client because a Redis connection in
// subscriber mode cannot issue regular commands.
let pubSubPair: { pub: Redis; sub: Redis } | null = null;

const createRedisClient = (): Redis | null => {
  try {
    const redisUrl = config.redis.url || process.env.REDIS_URL;

    // In test environment or when no redis configuration is provided, use seamless DB fallback
    if (!redisUrl && (!config.redis.host || config.redis.host === '127.0.0.1') && process.env.NODE_ENV === 'test') {
      return null;
    }

    // Only create client if URL is provided or explicitly configured
    if (!redisUrl && !process.env.REDIS_URL && !process.env.REDIS_HOST) {
      return null;
    }

    const options: RedisOptions = {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > 4) {
          return null; // Stop retrying after 4 attempts to preserve resources
        }
        return Math.min(times * 300, 3000);
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      lazyConnect: true,
    };

    if (redisUrl && redisUrl.trim().length > 0) {
      redisClient = new Redis(redisUrl, options);
    } else if (config.redis.host) {
      redisClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        ...options,
      });
    }

    if (redisClient) {
      redisClient.on('connect', () => {
        isRedisConnected = true;
        hasLoggedNotice = false;
        console.log('⚡ Redis Cache & Session Store connected successfully');
      });

      redisClient.on('ready', () => {
        isRedisConnected = true;
      });

      redisClient.on('error', (err: Error) => {
        isRedisConnected = false;
        if (!hasLoggedNotice && config.nodeEnv !== 'test') {
          hasLoggedNotice = true;
          console.warn(`⚠️ Redis Cache Notice: ${err.message}. Operating in Database fallback mode.`);
        }
      });

      redisClient.on('close', () => {
        isRedisConnected = false;
      });

      redisClient.connect().catch(() => {
        // Handled by event listener
      });
    }

    return redisClient;
  } catch {
    return null;
  }
};

export const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
};

/**
 * Build (once) a dedicated pub/sub connection pair for the Socket.IO Redis
 * adapter. A Redis connection placed in subscriber mode by the adapter cannot
 * issue regular commands, so the adapter MUST receive its own pair — never the
 * shared cache client. Both connections reuse the same URL/host config.
 *
 * Returns `null` when Redis is not configured, letting the caller fall back to
 * the in-memory Socket.IO adapter (single-instance behaviour).
 */
export const getRedisPubSubPair = (): { pub: Redis; sub: Redis } | null => {
  if (pubSubPair) return pubSubPair;

  const base = getRedisClient();
  if (!base) return null;

  try {
    const redisUrl = config.redis.url || process.env.REDIS_URL;
    const baseOptions = base.options;

    const makeConnection = (): Redis => {
      const options: RedisOptions = {
        ...baseOptions,
        // Adapter connections connect eagerly and keep retrying: unlike the
        // cache client (which backs off and falls back to the DB), a dead
        // pub/sub link silently breaks real-time events across instances.
        lazyConnect: false,
        maxRetriesPerRequest: null,
        retryStrategy: (times: number) => Math.min(times * 300, 3000),
        connectionName: 'crm-socketio-pubsub',
      };

      // A URL string and a discrete host/port object map to different ioredis
      // overloads, so branch explicitly rather than passing a union.
      const conn =
        redisUrl && redisUrl.trim().length > 0
          ? new Redis(redisUrl, options)
          : new Redis({
              ...options,
              host: config.redis.host,
              port: config.redis.port,
              password: config.redis.password,
            });

      // Never let an adapter connection crash the process on a transient
      // Redis error; the shared client already surfaces connectivity state.
      conn.on('error', (err: Error) => {
        if (config.nodeEnv !== 'test') {
          console.warn(`⚠️ Socket.IO Redis adapter connection error: ${err.message}`);
        }
      });

      return conn;
    };

    pubSubPair = { pub: makeConnection(), sub: makeConnection() };
    return pubSubPair;
  } catch {
    return null;
  }
};

export const isRedisAvailable = (): boolean => {
  return isRedisConnected && redisClient !== null && redisClient.status === 'ready';
};

export const closeRedis = async (): Promise<void> => {
  if (pubSubPair) {
    await Promise.allSettled([pubSubPair.pub.quit(), pubSubPair.sub.quit()]);
    pubSubPair = null;
  }
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed gracefully.');
    } catch {
      redisClient.disconnect();
    }
  }
};

export const redis = getRedisClient();
export default redis;
