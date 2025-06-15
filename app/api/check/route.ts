import { type NextRequest, NextResponse } from "next/server"

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

    // Get last-modified header
    const lastModified = response.headers.get("last-modified")
    if (lastModified) {
      result.lastModified = lastModified
    }

    // Simulate SSL certificate check (in production, you'd use a proper SSL checker)
    if (parsedUrl.protocol === "https:") {
      // Simulate SSL expiry date (30-90 days from now)
      const daysFromNow = Math.floor(Math.random() * 60) + 30
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + daysFromNow)

      result.sslExpiry = expiryDate.toISOString()
      result.sslDaysRemaining = daysFromNow
    }

    // Simulate uptime data (in production, integrate with monitoring service)
    result.uptime = {
      percentage: Math.random() * 5 + 95, // 95-100% uptime
      trend: Array.from({ length: 30 }, () => Math.random() * 0.3 + 0.7), // 30 days of trend data
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
