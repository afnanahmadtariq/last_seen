import fs from 'fs/promises'
import path from 'path'

interface UptimeRecord {
  timestamp: number
  status: 'online' | 'offline'
  responseTime?: number
}

interface UptimeData {
  url: string
  records: UptimeRecord[]
  lastUpdated: number
}

const DATA_DIR = path.join(process.cwd(), 'data', 'uptime')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

// Generate a safe filename from URL
function getUrlFilename(url: string): string {
  return url.replace(/[^a-zA-Z0-9]/g, '_') + '.json'
}

// Load uptime data for a URL
async function loadUptimeData(url: string): Promise<UptimeData> {
  await ensureDataDir()
  const filename = getUrlFilename(url)
  const filepath = path.join(DATA_DIR, filename)
  
  try {
    const data = await fs.readFile(filepath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist, return empty data
    return {
      url,
      records: [],
      lastUpdated: Date.now()
    }
  }
}

// Save uptime data for a URL
async function saveUptimeData(data: UptimeData): Promise<void> {
  await ensureDataDir()
  const filename = getUrlFilename(data.url)
  const filepath = path.join(DATA_DIR, filename)
  
  await fs.writeFile(filepath, JSON.stringify(data, null, 2))
}

// Add a new uptime record
export async function recordUptime(
  url: string, 
  status: 'online' | 'offline', 
  responseTime?: number
): Promise<void> {
  const data = await loadUptimeData(url)
  
  const now = Date.now()
  data.records.push({
    timestamp: now,
    status,
    responseTime
  })
  
  // Keep only last 30 days of records (assuming checks every hour = 720 records max)
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
  data.records = data.records.filter(record => record.timestamp >= thirtyDaysAgo)
  
  data.lastUpdated = now
  
  await saveUptimeData(data)
}

// Calculate uptime statistics
export async function getUptimeStats(url: string): Promise<{
  percentage: number
  trend: number[]
  totalChecks: number
  successfulChecks: number
} | null> {
  const data = await loadUptimeData(url)
  
  if (data.records.length === 0) {
    return null
  }
  
  const now = Date.now()
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
  
  // Filter to last 30 days
  const recentRecords = data.records.filter(record => record.timestamp >= thirtyDaysAgo)
  
  if (recentRecords.length === 0) {
    return null
  }
  
  // Calculate overall percentage
  const successfulChecks = recentRecords.filter(record => record.status === 'online').length
  const totalChecks = recentRecords.length
  const percentage = (successfulChecks / totalChecks) * 100
  
  // Calculate daily trend for last 30 days
  const trend: number[] = []
  for (let i = 29; i >= 0; i--) {
    const dayStart = now - (i * 24 * 60 * 60 * 1000)
    const dayEnd = dayStart + (24 * 60 * 60 * 1000)
    
    const dayRecords = recentRecords.filter(
      record => record.timestamp >= dayStart && record.timestamp < dayEnd
    )
    
    if (dayRecords.length === 0) {
      // No data for this day, use previous day's value or 0
      trend.push(trend.length > 0 ? trend[trend.length - 1] : 0)
    } else {
      const daySuccessful = dayRecords.filter(record => record.status === 'online').length
      const dayPercentage = (daySuccessful / dayRecords.length)
      trend.push(dayPercentage)
    }
  }
  
  return {
    percentage,
    trend,
    totalChecks,
    successfulChecks
  }
}

// Check if we should record uptime (to avoid too frequent updates)
export function shouldRecordUptime(url: string): boolean {
  // For demo purposes, always record. In production, you might want to limit frequency
  return true
}
