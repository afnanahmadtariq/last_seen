import { WebsiteProfiler } from './website-profiler'

// MongoDB-backed uptime tracker (no filesystem operations)

// Add a new uptime record for a user/URL
export async function recordUptime(
  url: string,
  status: 'online' | 'offline',
  responseTime: number | undefined,
  userId: string,
  options?: {
    lastModified?: string
    sslInfo?: { valid: boolean; expiry: string; daysRemaining: number }
  }
): Promise<void> {
  await WebsiteProfiler.recordCheck(
    {
      url,
      status,
      responseTime,
      lastModified: options?.lastModified,
      sslInfo: options?.sslInfo,
    },
    userId,
  )
}

// Calculate uptime statistics (delegates to MongoDB)
export async function getUptimeStats(
  url: string,
  userId: string,
  days = 30,
): Promise<{
  percentage: number
  trend: number[]
  totalChecks: number
  successfulChecks: number
} | null> {
  return WebsiteProfiler.getUptimeStats(url, userId, days)
}

// Hook for throttling if desired (kept for API parity)
export function shouldRecordUptime(_url: string): boolean {
  return true
}
