import { type NextRequest, NextResponse } from "next/server"
import sslChecker from "ssl-checker"
import { recordUptime, getUptimeStats, shouldRecordUptime } from "@/lib/uptime-tracker"

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
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url)

    const startTime = Date.now()

    // Make the request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      method: "HEAD", // Use HEAD to avoid downloading full content
      signal: controller.signal,
      headers: {
        "User-Agent": "LastSeenPing/1.0 (Website Status Checker)",
      },
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    const result: CheckResult = {
      url: parsedUrl.toString(),
      status: response.ok ? "online" : "offline",
      statusCode: response.status,
      responseTime,
    }

    // Record uptime data
    if (shouldRecordUptime(parsedUrl.toString())) {
      await recordUptime(parsedUrl.toString(), result.status, responseTime)
    }

    // Get uptime statistics
    const uptimeStats = await getUptimeStats(parsedUrl.toString())
    if (uptimeStats) {
      result.uptime = uptimeStats
    }

    // Get last-modified header
    const lastModified = response.headers.get("last-modified")
    if (lastModified) {
      result.lastModified = lastModified
    }

    // Get real SSL certificate information for HTTPS sites
    if (parsedUrl.protocol === "https:") {
      try {
        const hostname = parsedUrl.hostname
        const sslInfo = await sslChecker(hostname)
        
        if (sslInfo && sslInfo.valid) {
          result.sslExpiry = sslInfo.validTo
          result.sslDaysRemaining = sslInfo.daysRemaining
        }
      } catch (sslError) {
        console.warn(`SSL check failed for ${parsedUrl.hostname}:`, sslError)
        // SSL info will remain undefined if check fails
      }
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
      if (shouldRecordUptime(parsedUrl.toString())) {
        await recordUptime(parsedUrl.toString(), 'offline')
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
