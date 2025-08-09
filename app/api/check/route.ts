import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import sslChecker from "ssl-checker"
import { recordUptime, getUptimeStats, shouldRecordUptime } from "@/lib/uptime-tracker"
import { WebsiteProfiler } from "@/lib/website-profiler"

interface CheckResult {
  url: string
  status: "online" | "offline"
  lastModified?: string
  sslExpiry?: string
  sslDaysRemaining?: number
  responseTime?: number
  statusCode?: number
  uptime?: {
    percentage: number
    trend: number[]
    totalChecks: number
    successfulChecks: number
  }
  error?: string
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url)

    const startTime = Date.now()

    // Make the request with timeout and get full response for metadata extraction
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      method: "GET", // Use GET to get full content for metadata extraction
      signal: controller.signal,
      headers: {
        "User-Agent": "LastSeenPing/1.0 (Website Status Checker)",
      },
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    // Get response text for metadata extraction (only for successful responses)
    let htmlContent = ''
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
      try {
        htmlContent = await response.text()
      } catch (err) {
        console.warn('Failed to read response text:', err)
      }
    }

    const result: CheckResult = {
      url: parsedUrl.toString(),
      status: response.ok ? "online" : "offline",
      statusCode: response.status,
      responseTime,
    }

    // Extract metadata from HTML content
    let metadata
    if (htmlContent) {
      try {
        metadata = await WebsiteProfiler.extractMetadataFromHtml(htmlContent, parsedUrl.toString())
      } catch (err) {
        console.warn('Failed to extract metadata:', err)
      }
    }

    // Get SSL information
    let sslInfo
    if (parsedUrl.protocol === "https:") {
      try {
        const hostname = parsedUrl.hostname
        const sslData = await sslChecker(hostname)
        
        if (sslData && sslData.valid) {
          result.sslExpiry = sslData.validTo
          result.sslDaysRemaining = sslData.daysRemaining
          
          sslInfo = {
            valid: sslData.valid,
            expiry: sslData.validTo,
            daysRemaining: sslData.daysRemaining,
          }
        }
      } catch (sslError) {
        console.warn(`SSL check failed for ${parsedUrl.hostname}:`, sslError)
      }
    }

    // Record to MongoDB profiling system and uptime
    try {
      await WebsiteProfiler.createOrUpdateProfile(parsedUrl.toString(), session.user.id, metadata)
      await WebsiteProfiler.recordCheck({
        url: parsedUrl.toString(),
        status: result.status,
        statusCode: result.statusCode,
        responseTime,
        lastModified: response.headers.get("last-modified") || undefined,
        sslInfo,
      }, session.user.id)
    } catch (dbError) {
      console.warn('Failed to record to MongoDB:', dbError)
    }

    // Record uptime data (Mongo only)
    if (shouldRecordUptime(parsedUrl.toString())) {
      await recordUptime(parsedUrl.toString(), result.status, responseTime, session.user.id, {
        lastModified: response.headers.get("last-modified") || undefined,
        sslInfo,
      })
    }

    // Get uptime statistics (Mongo only)
    let uptimeStats
    uptimeStats = await getUptimeStats(parsedUrl.toString(), session.user.id)
    
    if (uptimeStats) {
      result.uptime = uptimeStats
    }

    // Get last-modified header
    const lastModified = response.headers.get("last-modified")
    if (lastModified) {
      result.lastModified = lastModified
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error checking website:", error)

    let errorMessage = "Failed to check website"

    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage = "Website is unreachable or does not exist"
    } else if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Request timeout - website took too long to respond"
      } else if (error.message.includes("Invalid URL")) {
        errorMessage = "Invalid URL format"
      }
    }

    // Record offline status for uptime tracking
    try {
      const parsedUrl = new URL(url)
      
      // Record to MongoDB profiling system
      try {
        await WebsiteProfiler.recordCheck({
          url: parsedUrl.toString(),
          status: 'offline',
          error: errorMessage,
        }, session.user.id)
      } catch (dbError) {
        console.warn('Failed to record offline status to MongoDB:', dbError)
      }
      
      // Uptime record (Mongo only)
      if (shouldRecordUptime(parsedUrl.toString())) {
        await recordUptime(parsedUrl.toString(), 'offline', undefined, session.user.id)
      }
    } catch {
      // Ignore errors in uptime recording during error handling
    }

    return NextResponse.json(
      {
        url,
        status: "offline" as const,
        error: errorMessage,
      },
      { status: 200 }, // Return 200 but with error in response body
    )
  }
}
