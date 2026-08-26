import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

// Load environment variables from .env file (same as Prisma)
config();

/**
 * Two-tier cache.
 *
 * L1 - an in-process Map with TTLs. Always on, costs nothing, survives no
 *      external outage because there is no external service. Scoped to one
 *      server instance, so it is a latency win rather than a shared cache.
 * L2 - Upstash Redis, used only when UPSTASH_REDIS_REST_* are set. Shared
 *      across instances, but entirely optional: every method degrades to L1
 *      when Redis is absent, unreachable, or tripped by the circuit breaker.
 *
 * Reads check L1, then L2, and backfill L1 on an L2 hit. Writes go to both.
 */

// Initialize Redis client lazily (will be undefined if env vars not set)
let redis: Redis | undefined;
let initialized = false;

// A configured-but-unreachable Redis must never slow down a request. The Upstash
// client defaults to 5 retries with `Math.exp(n) * 50` backoff, which turns a dead
// host into a ~4.4s block on every call, so cap the retries and the wall clock.
const REQUEST_TIMEOUT_MS = 1000;
const FAILURES_BEFORE_TRIP = 3;
const CIRCUIT_COOLDOWN_MS = 30_000;

// L1 bounds. The cached payloads are small JSON blobs (site lists), so a few
// hundred entries is plenty and keeps the footprint trivial.
const MEMORY_MAX_ENTRIES = 500;
// TTL applied when backfilling L1 from an L2 hit. Redis owns the authoritative
// TTL and we cannot read the remainder cheaply, so keep the local copy short.
const MEMORY_BACKFILL_TTL_MS = 30_000;

interface MemoryEntry {
  value: unknown;
  expiresAt: number;
}

const memory = new Map<string, MemoryEntry>();

function memoryGet<T>(key: string): T | null {
  const entry = memory.get(key);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAt) {
    memory.delete(key);
    return null;
  }

  // Refresh insertion order so the hottest keys survive eviction.
  memory.delete(key);
  memory.set(key, entry);
  return entry.value as T;
}

function memorySet(key: string, value: unknown, ttlMs: number) {
  memory.delete(key);
  memory.set(key, { value, expiresAt: Date.now() + ttlMs });

  // Evict the least recently used entries once over budget. Drop anything
  // already expired first, then fall back to insertion order.
  if (memory.size > MEMORY_MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of memory) {
      if (memory.size <= MEMORY_MAX_ENTRIES) break;
      if (now >= v.expiresAt) memory.delete(k);
    }
    while (memory.size > MEMORY_MAX_ENTRIES) {
      const oldest = memory.keys().next();
      if (oldest.done) break;
      memory.delete(oldest.value);
    }
  }
}

/** Translate a Redis glob pattern (`sites:*`) into an anchored RegExp. */
function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
}

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

/** True when an L2 call should be attempted right now. */
function redisUsable(): boolean {
  return !!redis && !circuitIsOpen();
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
      `⚠️  Redis unreachable after ${consecutiveFailures} attempts - using in-memory cache ` +
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
      console.warn('⚠️  Redis not configured - using in-memory cache only');
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
   * Get value from cache. Checks L1, then L2, backfilling L1 on an L2 hit.
   */
  async get<T>(key: string): Promise<T | null> {
    const local = memoryGet<T>(key);
    if (local !== null) return local;

    if (!redisUsable()) return null;

    try {
      const value = await redis!.get<T>(key);
      recordSuccess();
      if (value !== null && value !== undefined) {
        memorySet(key, value, MEMORY_BACKFILL_TTL_MS);
        return value;
      }
      return null;
    } catch (error) {
      recordFailure('get', error);
      return null;
    }
  },

  /**
   * Like `get`, but reports which tier served the value so callers can label
   * their response honestly. `tier` is null on a miss.
   */
  async getWithTier<T>(key: string): Promise<{ value: T | null; tier: 'memory' | 'redis' | null }> {
    const local = memoryGet<T>(key);
    if (local !== null) return { value: local, tier: 'memory' };

    if (!redisUsable()) return { value: null, tier: null };

    try {
      const value = await redis!.get<T>(key);
      recordSuccess();
      if (value !== null && value !== undefined) {
        memorySet(key, value, MEMORY_BACKFILL_TTL_MS);
        return { value, tier: 'redis' };
      }
      return { value: null, tier: null };
    } catch (error) {
      recordFailure('get', error);
      return { value: null, tier: null };
    }
  },

  /**
   * Set value in cache with TTL (in seconds). Always writes L1; writes L2 when
   * available. Returns true if the value reached Redis.
   */
  async set(key: string, value: any, ttl: number = 60): Promise<boolean> {
    memorySet(key, value, ttl * 1000);

    if (!redisUsable()) return false;

    try {
      // Upstash Redis automatically handles JSON serialization
      await redis!.setex(key, ttl, value);
      recordSuccess();
      return true;
    } catch (error) {
      recordFailure('set', error);
      return false;
    }
  },

  /**
   * Delete key from both tiers.
   */
  async del(key: string): Promise<boolean> {
    memory.delete(key);

    if (!redisUsable()) return false;

    try {
      await redis!.del(key);
      recordSuccess();
      return true;
    } catch (error) {
      recordFailure('del', error);
      return false;
    }
  },

  /**
   * Delete keys matching a glob pattern from both tiers. Returns the number of
   * keys removed from Redis (0 when Redis is unavailable); L1 is always purged.
   */
  async delPattern(pattern: string): Promise<number> {
    const matcher = globToRegExp(pattern);
    for (const key of [...memory.keys()]) {
      if (matcher.test(key)) memory.delete(key);
    }

    if (!redisUsable()) return 0;

    try {
      const keys = await redis!.keys(pattern);
      recordSuccess();
      if (keys.length === 0) return 0;

      await redis!.del(...keys);
      return keys.length;
    } catch (error) {
      recordFailure('delPattern', error);
      return 0;
    }
  },

  /**
   * Check if the distributed (Redis) tier is currently usable. The in-memory
   * tier is always available, so this reports L2 only.
   */
  isAvailable(): boolean {
    return redisUsable();
  },

  /**
   * Round-trip a real command to Redis. Used by the keep-alive cron to reset
   * Upstash's inactivity timer (free databases are deleted after 14 days idle).
   */
  async ping(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    if (!redis) {
      return { ok: false, latencyMs: 0, error: 'Redis not configured' };
    }

    const startedAt = Date.now();
    try {
      await redis.set('cache:keep-alive', new Date().toISOString(), { ex: 86_400 });
      recordSuccess();
      return { ok: true, latencyMs: Date.now() - startedAt };
    } catch (error) {
      recordFailure('ping', error);
      return {
        ok: false,
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Observability for the in-memory tier.
   */
  stats(): { memoryEntries: number; redisConfigured: boolean; redisUsable: boolean } {
    return {
      memoryEntries: memory.size,
      redisConfigured: !!redis,
      redisUsable: redisUsable(),
    };
  },

  /**
   * Flush both tiers (use with caution!)
   */
  async flush(): Promise<boolean> {
    memory.clear();

    if (!redisUsable()) return false;

    try {
      await redis!.flushdb();
      recordSuccess();
      return true;
    } catch (error) {
      recordFailure('flush', error);
      return false;
    }
  },
};

export { redis };
