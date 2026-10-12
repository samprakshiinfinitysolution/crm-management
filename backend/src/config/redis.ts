// src/config/redis.ts

import { Redis, RedisOptions } from 'ioredis';
import { config } from './env.js';

let redisClient: Redis | null = null;
let isRedisConnected = false;

let hasLoggedNotice = false;
let hasLoggedPubSubNotice = false;

// Dedicated pub/sub connection pair for the Socket.IO Redis adapter. Kept
// separate from the shared cache client because a Redis connection in
// subscriber mode cannot issue regular commands.
let pubSubPair: { pub: Redis; sub: Redis } | null = null;

const createRedisClient = (): Redis | null => {
  try {
    const redisUrl = (config.redis.url || process.env.REDIS_URL || '').trim();
    const redisHost = (config.redis.host || process.env.REDIS_HOST || '').trim();

    // If no Redis URL and no explicit host is configured, cleanly skip Redis
    if (!redisUrl && !redisHost) {
      return null;
    }

    // In production or test environments, do not connect to localhost 127.0.0.1 unless explicitly forced
    if (!redisUrl && redisHost === '127.0.0.1') {
      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' || !process.env.REDIS_HOST) {
        return null;
      }
    }

    const options: RedisOptions = {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts to preserve resources
        }
        return Math.min(times * 300, 2000);
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

    if (redisUrl.length > 0) {
      redisClient = new Redis(redisUrl, options);
    } else if (redisHost.length > 0) {
      redisClient = new Redis({
        host: redisHost,
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

  const redisUrl = (config.redis.url || process.env.REDIS_URL || '').trim();
  const redisHost = (config.redis.host || process.env.REDIS_HOST || '').trim();

  // If Redis is not configured, cleanly return null to use in-memory adapter
  if (!redisUrl && !redisHost) {
    return null;
  }

  if (!redisUrl && redisHost === '127.0.0.1' && (process.env.NODE_ENV === 'production' || !process.env.REDIS_HOST)) {
    return null;
  }

  const base = getRedisClient();
  if (!base) return null;

  try {
    const baseOptions = base.options;

    const makeConnection = (): Redis => {
      const options: RedisOptions = {
        ...baseOptions,
        lazyConnect: false,
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts to prevent log flood
          }
          return Math.min(times * 500, 2000);
        },
        connectionName: 'crm-socketio-pubsub',
      };

      const conn =
        redisUrl.length > 0
          ? new Redis(redisUrl, options)
          : new Redis({
              ...options,
              host: redisHost,
              port: config.redis.port,
              password: config.redis.password,
            });

      conn.on('error', (err: Error) => {
        if (!hasLoggedPubSubNotice && config.nodeEnv !== 'test') {
          hasLoggedPubSubNotice = true;
          console.warn(`⚠️ Socket.IO Redis adapter connection error: ${err.message}. Operating in in-memory adapter fallback mode.`);
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
