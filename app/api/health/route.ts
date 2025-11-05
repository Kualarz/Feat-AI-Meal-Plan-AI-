import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Health Check');

export async function GET() {
  try {
    const startTime = Date.now();
    const checks: Record<string, any> = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'development',
    };

    // Check database connection
    try {
      await db.$queryRaw`SELECT 1`;
      checks.database = { status: 'connected', responseTime: `${Date.now() - startTime}ms` };
    } catch (error) {
      checks.database = { status: 'disconnected', error: error instanceof Error ? error.message : 'Unknown error' };
      checks.status = 'degraded';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    checks.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    };

    // Determine HTTP status code
    const statusCode = checks.status === 'healthy' ? 200 : 503;

    logger.info('Health check completed', { data: checks });

    return NextResponse.json(checks, { status: statusCode });
  } catch (error) {
    logger.error('Health check failed', error as Error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
