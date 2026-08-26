import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

// Load environment variables from .env file (same as Prisma)
config();

// Initialize Redis client lazily (will be undefined if env vars not set)
let redis: Redis | undefined;
let initialized = false;

// A configured-but-unreachable Redis must never slow down a request. The Upstash
// client defaults to 5 retries with `Math.exp(n) * 50` backoff, which turns a dead
// host into a ~4.4s block on every call, so cap the retries and the wall clock.
const REQUEST_TIMEOUT_MS = 1000;
const FAILURES_BEFORE_TRIP = 3;
const CIRCUIT_COOLDOWN_MS = 30_000;

// Circuit breaker: after repeated failures, skip Redis entirely for a cooldown
// period instead of paying the timeout on every request.
let consecutiveFailures = 0;
let circuitOpenUntil = 0;

function circuitIsOpen(): boolean {
  if (circuitOpenUntil === 0) return false;
  if (Date.now() < circuitOpenUntil) return true;
  // Cooldown elapsed - allow a single probe through to see if Redis is back.
  circuitOpenUntil = 0;
  consecutiveFailures = 0;
  return false;
}

function recordSuccess() {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
}

function recordFailure(operation: string, error: unknown) {
  consecutiveFailures += 1;
  if (consecutiveFailures >= FAILURES_BEFORE_TRIP && circuitOpenUntil === 0) {
    circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    console.warn(
      `⚠️  Redis unreachable after ${consecutiveFailures} attempts - serving from the database ` +
        `for the next ${CIRCUIT_COOLDOWN_MS / 1000}s`
    );
  } else if (circuitOpenUntil === 0) {
    console.error(`Redis ${operation} error:`, error instanceof Error ? error.message : error);
  }
}

function initializeRedis() {
  if (initialized) return;
  initialized = true;

  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      redis = new Redis({
        url,
        token,
        retry: { retries: 1, backoff: () => 100 },
        signal: () => AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      console.log('✅ Redis connected:', url.substring(0, 30) + '...');
    } else {
      console.warn('⚠️  Redis not configured - using in-memory cache fallback');
    }
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
  }
}

// Initialize on first import
initializeRedis();

// Cache utilities
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis || circuitIsOpen()) return null;

    try {
      const value = await redis.get<T>(key);
      recordSuccess();
      return value;
    } catch (error) {
      recordFailure('get', error);
      return null;
    }
  },

  /**
   * Set value in cache with TTL (in seconds)
   */
  async set(key: string, value: any, ttl: number = 60): Promise<boolean> {
    if (!redis || circuitIsOpen()) return false;

    try {
      // Upstash Redis automatically handles JSON serialization
      await redis.setex(key, ttl, value);
      recordSuccess();
      return true;
    } catch (error) {
      recordFailure('set', error);
      return false;
    }
  },

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!redis || circuitIsOpen()) return false;

    try {
      await redis.del(key);
      recordSuccess();
      return true;
    } catch (error) {
      recordFailure('del', error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!redis || circuitIsOpen()) return 0;

    try {
      const keys = await redis.keys(pattern);
      recordSuccess();
      if (keys.length === 0) return 0;

      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      recordFailure('delPattern', error);
      return 0;
    }
  },

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return !!redis && !circuitIsOpen();
  },

  /**
   * Flush entire cache (use with caution!)
   */
  async flush(): Promise<boolean> {
    if (!redis || circuitIsOpen()) return false;

    try {
      await redis.flushdb();
      recordSuccess();
      return true;
    } catch (error) {
      recordFailure('flush', error);
      return false;
    }
  },
};

export { redis };
