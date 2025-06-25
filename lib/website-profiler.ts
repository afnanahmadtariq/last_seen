import connectToDatabase from './mongodb'
import { WebsiteProfile, CheckHistory, PerformanceMetrics, WebsiteAnalytics } from './models'

interface WebsiteMetadata {
  title?: string
  description?: string
  favicon?: string
  language?: string
  charset?: string
  robots?: string
  viewport?: string
}

interface CheckResult {
  url: string
  status: 'online' | 'offline'
  statusCode?: number
  responseTime?: number
  lastModified?: string
  sslInfo?: {
    valid: boolean
    expiry: string
    daysRemaining: number
  }
  error?: string
}

export class WebsiteProfiler {
    static async createOrUpdateProfile(url: string, userId: string, metadata?: WebsiteMetadata) {
    await connectToDatabase()
    
    const domain = new URL(url).hostname
    
    let profile = await WebsiteProfile.findOne({ url, userId })
    
    if (!profile) {
      profile = new WebsiteProfile({
        url,
        domain,
        userId,
        title: metadata?.title,
        description: metadata?.description,
        favicon: metadata?.favicon,
        metadata: {
          language: metadata?.language,
          charset: metadata?.charset,
          robots: metadata?.robots,
          viewport: metadata?.viewport,
        },
      })
    } else {
      // Update existing profile
      if (metadata?.title) profile.title = metadata.title
      if (metadata?.description) profile.description = metadata.description
      if (metadata?.favicon) profile.favicon = metadata.favicon
      if (metadata?.language) profile.metadata.language = metadata.language
      if (metadata?.charset) profile.metadata.charset = metadata.charset
      if (metadata?.robots) profile.metadata.robots = metadata.robots
      if (metadata?.viewport) profile.metadata.viewport = metadata.viewport
      
      profile.lastChecked = new Date()
    }
    
    await profile.save()
    return profile
  }
    static async recordCheck(checkResult: CheckResult, userId: string) {
    await connectToDatabase()
    
    // Get or create website profile
    const profile = await this.createOrUpdateProfile(checkResult.url, userId)
      // Record check history
    const checkHistory = new CheckHistory({
      userId: userId,
      websiteId: profile._id,
      url: checkResult.url,
      status: checkResult.status,
      statusCode: checkResult.statusCode,
      responseTime: checkResult.responseTime,
      lastModified: checkResult.lastModified ? new Date(checkResult.lastModified) : undefined,      sslInfo: checkResult.sslInfo ? {
        valid: checkResult.sslInfo.valid,
        expiry: new Date(checkResult.sslInfo.expiry),
        daysRemaining: checkResult.sslInfo.daysRemaining,
      } : undefined,
      error: checkResult.error,
    })
    
    await checkHistory.save()
      // Update analytics
    await this.updateAnalytics(profile._id, checkResult, userId)
    
    return checkHistory
  }
  
  static async updateAnalytics(websiteId: string, checkResult: CheckResult, userId: string) {
    let analytics = await WebsiteAnalytics.findOne({ websiteId })
      if (!analytics) {
      analytics = new WebsiteAnalytics({
        userId: userId,
        websiteId,
        url: checkResult.url,
        totalChecks: 0,
        overallUptime: 100,
        avgResponseTime: 0,
      })
    }
    
    analytics.totalChecks += 1
    analytics.lastStatus = checkResult.status
    
    // Calculate overall uptime
    const successfulChecks = await CheckHistory.countDocuments({
      websiteId,
      status: 'online'
    })
    
    analytics.overallUptime = (successfulChecks / analytics.totalChecks) * 100
    
    // Calculate average response time
    if (checkResult.responseTime) {
      const avgResult = await CheckHistory.aggregate([
        { $match: { websiteId: websiteId, responseTime: { $exists: true } } },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
      ])
      
      if (avgResult.length > 0) {
        analytics.avgResponseTime = Math.round(avgResult[0].avgResponseTime)
      }
    }
    
    // Update SSL status
    if (checkResult.sslInfo) {
      analytics.sslStatus = {
        valid: checkResult.sslInfo.valid,
        expiry: new Date(checkResult.sslInfo.expiry),
        daysRemaining: checkResult.sslInfo.daysRemaining,
      }
    }
    
    // Handle downtime tracking
    if (checkResult.status === 'offline') {
      analytics.consecutiveDowntime += 1
    } else {
      if (analytics.consecutiveDowntime > 0) {
        // End of downtime period
        if (analytics.consecutiveDowntime > analytics.longestDowntime) {
          analytics.longestDowntime = analytics.consecutiveDowntime
        }
        analytics.consecutiveDowntime = 0
      }
    }
    
    await analytics.save()
    return analytics
  }
    static async getWebsiteProfile(url: string, userId: string) {
    await connectToDatabase()
    
    const profile = await WebsiteProfile.findOne({ url, userId })
    if (!profile) return null
    
    const analytics = await WebsiteAnalytics.findOne({ websiteId: profile._id })
    const recentChecks = await CheckHistory.find({ websiteId: profile._id })
      .sort({ checkTime: -1 })
      .limit(30)
    
    return {
      profile,
      analytics,
      recentChecks,
    }
  }
  
  static async getAllProfiles(limit = 50, offset = 0) {
    await connectToDatabase()
    
    const profiles = await WebsiteProfile.find({ isActive: true })
      .sort({ lastChecked: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
    
    const profilesWithAnalytics = await Promise.all(
      profiles.map(async (profile) => {
        const analytics = await WebsiteAnalytics.findOne({ websiteId: profile._id }).lean()
        return {
          ...profile,
          analytics,
        }
      })
    )
    
    return profilesWithAnalytics
  }
  
  static async getUserProfiles(userId: string, limit = 50, offset = 0) {
    await connectToDatabase()
    
    const profiles = await WebsiteProfile.find({ userId, isActive: true })
      .sort({ lastChecked: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
    
    const profilesWithAnalytics = await Promise.all(
      profiles.map(async (profile) => {
        const analytics = await WebsiteAnalytics.findOne({ websiteId: profile._id }).lean()
        return {
          ...profile,
          analytics,
        }
      })
    )
    
    return profilesWithAnalytics
  }
    static async getUptimeStats(url: string, userId: string, days = 30) {
    await connectToDatabase()
    
    const profile = await WebsiteProfile.findOne({ url, userId })
    if (!profile) return null
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const checks = await CheckHistory.find({
      websiteId: profile._id,
      checkTime: { $gte: startDate }
    }).sort({ checkTime: 1 })
    
    if (checks.length === 0) return null
    
    const totalChecks = checks.length
    const successfulChecks = checks.filter(check => check.status === 'online').length
    const percentage = (successfulChecks / totalChecks) * 100
    
    // Calculate daily trend
    const trend: number[] = []
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date()
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayChecks = checks.filter(
        check => check.checkTime >= dayStart && check.checkTime <= dayEnd
      )
      
      if (dayChecks.length === 0) {
        trend.push(0)
      } else {
        const daySuccessful = dayChecks.filter(check => check.status === 'online').length
        trend.push(daySuccessful / dayChecks.length)
      }
    }
    
    return {
      percentage,
      trend,
      totalChecks,
      successfulChecks,
    }
  }
  
  static async extractMetadataFromHtml(html: string, url: string): Promise<WebsiteMetadata> {
    const metadata: WebsiteMetadata = {}
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      metadata.title = titleMatch[1].trim()
    }
    
    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=['"']description['"'][^>]*content=['"']([^'"]+)['"'][^>]*>/i)
    if (descMatch) {
      metadata.description = descMatch[1].trim()
    }
    
    // Extract favicon
    const faviconMatch = html.match(/<link[^>]*rel=['"'](?:shortcut )?icon['"'][^>]*href=['"']([^'"]+)['"'][^>]*>/i)
    if (faviconMatch) {
      const faviconUrl = faviconMatch[1]
      if (faviconUrl.startsWith('http')) {
        metadata.favicon = faviconUrl
      } else {
        const baseUrl = new URL(url).origin
        metadata.favicon = new URL(faviconUrl, baseUrl).href
      }
    }
    
    // Extract language
    const langMatch = html.match(/<html[^>]*lang=['"']([^'"]+)['"'][^>]*>/i)
    if (langMatch) {
      metadata.language = langMatch[1]
    }
    
    // Extract charset
    const charsetMatch = html.match(/<meta[^>]*charset=['"']([^'"]+)['"'][^>]*>/i)
    if (charsetMatch) {
      metadata.charset = charsetMatch[1]
    }
    
    return metadata
  }
}
