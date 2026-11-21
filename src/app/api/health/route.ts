import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  let database = 'ok';
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = 'unreachable';
  }

  const healthy = database === 'ok';

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      database,
      uptimeSeconds: Math.round(process.uptime()),
      checkedInMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
