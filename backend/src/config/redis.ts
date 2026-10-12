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

function isLocalhost(value: string): boolean {
  if (!value) return false;
  return value.includes('127.0.0.1') || value.includes('localhost') || value.includes('::1');
}

/**
 * Checks whether Redis is genuinely configured with an accessible endpoint.
 * In cloud / production environments (like Render or Vercel), localhost (127.0.0.1)
 * does not run a Redis server, so we skip Redis and use seamless database fallbacks.
 */
function isRedisConfigured(): boolean {
  const redisUrl = (config.redis.url || process.env.REDIS_URL || '').trim();
  const redisHost = (config.redis.host || process.env.REDIS_HOST || '').trim();

  // Nothing configured at all
  if (!redisUrl && !redisHost) {
    return false;
  }

  const isCloudOrProd =
    config.nodeEnv === 'production' ||
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER || process.env.VERCEL);

  // In cloud/production environments, localhost/127.0.0.1 cannot reach a Redis service
  if (isCloudOrProd) {
    if (redisUrl && isLocalhost(redisUrl)) {
      return false;
    }
    if (redisHost && isLocalhost(redisHost)) {
      return false;
    }
  }

  // In test environments, disable Redis unless explicitly requested
  if (process.env.NODE_ENV === 'test' && !process.env.TEST_REDIS) {
    return false;
  }

  return true;
}

const createRedisClient = (): Redis | null => {
  if (!isRedisConfigured()) {
    return null;
  }

  try {
    const redisUrl = (config.redis.url || process.env.REDIS_URL || '').trim();
    const redisHost = (config.redis.host || process.env.REDIS_HOST || '').trim();

    const options: RedisOptions = {
      enableOfflineQueue: false, // Never accumulate commands while disconnected to avoid MaxRetriesPerRequestError
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts to prevent resource leaks
        }
        return Math.min(times * 500, 2500);
      },
      reconnectOnError: (err: Error) => {
        if (err.message.includes('READONLY')) {
          return true;
        }
        return false;
      },
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
        // Handled by error listener
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

  // If Redis is not configured for this environment, return null immediately
  if (!isRedisConfigured()) {
    return null;
  }

  const base = getRedisClient();
  if (!base) return null;

  try {
    const redisUrl = (config.redis.url || process.env.REDIS_URL || '').trim();
    const redisHost = (config.redis.host || process.env.REDIS_HOST || '').trim();
    const baseOptions = base.options;

    const makeConnection = (): Redis => {
      const options: RedisOptions = {
        ...baseOptions,
        lazyConnect: false,
        // The adapter issues subscribe()/publish() as soon as it attaches. Keep
        // the offline queue ENABLED for these dedicated connections so those
        // commands wait for the connection instead of rejecting immediately
        // (an early rejection here can crash startup before the port binds).
        enableOfflineQueue: true,
        maxRetriesPerRequest: null,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts
          }
          return Math.min(times * 500, 2500);
        },
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
          console.warn(`⚠️ Socket.IO Redis adapter connection notice: ${err.message}. Operating with in-memory adapter.`);
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
    try {
      await Promise.allSettled([pubSubPair.pub.quit(), pubSubPair.sub.quit()]);
    } catch {
      pubSubPair.pub.disconnect();
      pubSubPair.sub.disconnect();
    }
    pubSubPair = null;
  }
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed gracefully.');
    } catch {
      redisClient.disconnect();
    }
    redisClient = null;
  }
};

export const redis = getRedisClient();
export default redis;
