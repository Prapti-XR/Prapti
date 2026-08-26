import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/redis';

/**
 * Redis Keep-Alive Cron
 * GET /api/cron/keep-alive
 *
 * Upstash deletes free databases after 14 days of inactivity - which is exactly
 * how the previous instance was lost. Any command resets that timer, so this
 * route issues one real write on a schedule (see `crons` in vercel.json).
 *
 * Auth: when CRON_SECRET is set, Vercel Cron sends `Authorization: Bearer <secret>`
 * and anything else is rejected, so the endpoint cannot be hammered publicly.
 */

// Never statically optimized - this must run on every invocation.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const authorization = request.headers.get('authorization');
    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = await cache.ping();
  const stats = cache.stats();

  if (!result.ok) {
    // 200 when Redis simply isn't configured (in-memory tier is fine on its own);
    // 503 when it is configured but the command failed, so the cron surfaces it.
    const notConfigured = !stats.redisConfigured;
    return NextResponse.json(
      {
        success: notConfigured,
        data: {
          pinged: false,
          reason: result.error,
          ...stats,
        },
      },
      { status: notConfigured ? 200 : 503 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      pinged: true,
      latencyMs: result.latencyMs,
      at: new Date().toISOString(),
      ...stats,
    },
  });
}
