"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Globe, Shield, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react"

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

export default function LastSeenPing() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState("")

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const formatUrl = (url: string): string => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`
    }
    return url
  }

  const handleCheck = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL")
      return
    }

    const formattedUrl = formatUrl(url.trim())

    if (!validateUrl(formattedUrl)) {
      setError("Please enter a valid URL")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`/api/check?url=${encodeURIComponent(formattedUrl)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check website")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "No data available"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSSLBadgeVariant = (daysRemaining?: number) => {
    if (!daysRemaining) return "secondary"
    if (daysRemaining < 7) return "destructive"
    if (daysRemaining < 30) return "default"
    return "secondary"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">🛰️ LastSeenPing</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Real-time website monitoring with uptime tracking and SSL certificate information</p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website Checker
            </CardTitle>
            <CardDescription>Enter a website URL to check its real-time status, SSL certificate, and uptime history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCheck()}
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={handleCheck} disabled={loading} className="min-w-[120px]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Status"
                )}
              </Button>
            </div>
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Server Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant={result.status === "online" ? "default" : "destructive"}>
                      {result.status === "online" ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  {result.statusCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">HTTP Status</span>
                      <span className="font-mono text-sm">{result.statusCode}</span>
                    </div>
                  )}
                  {result.responseTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                      <span className="font-mono text-sm">{result.responseTime}ms</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Last Modified Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Content Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.lastModified ? "Last modified" : "Status"}
                  </p>
                  <p className="font-medium">
                    {result.lastModified ? formatDate(result.lastModified) : "No data available"}
                  </p>
                  {!result.lastModified && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Site may not provide last-modified headers
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SSL Certificate Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  SSL Certificate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.sslExpiry ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Expires</span>
                        <span className="text-sm">{formatDate(result.sslExpiry)}</span>
                      </div>
                      {result.sslDaysRemaining !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Days remaining</span>
                          <Badge variant={getSSLBadgeVariant(result.sslDaysRemaining)}>
                            {result.sslDaysRemaining} days
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.url.startsWith('https://') 
                          ? "SSL certificate information could not be retrieved" 
                          : "SSL certificate not applicable for HTTP sites"
                        }
                      </p>
                      {result.url.startsWith('https://') && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          The site may be using a CDN or have SSL information protected
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Uptime Trend Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Uptime History (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.uptime ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                          <Badge variant={result.uptime.percentage > 95 ? "default" : result.uptime.percentage > 90 ? "secondary" : "destructive"}>
                            {result.uptime.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Checks</span>
                          <span className="text-sm">{result.uptime.successfulChecks}/{result.uptime.totalChecks}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Daily trend (30 days)</span>
                        <div className="flex gap-1 h-8 items-end">
                          {result.uptime.trend.map((value: number, index: number) => (
                            <div
                              key={index}
                              className={`flex-1 rounded-sm ${
                                value > 0.95 ? 'bg-green-400 dark:bg-green-600' :
                                value > 0.8 ? 'bg-yellow-400 dark:bg-yellow-600' :
                                value > 0 ? 'bg-red-400 dark:bg-red-600' :
                                'bg-gray-200 dark:bg-gray-700'
                              }`}
                              style={{ height: `${Math.max(value * 100, 5)}%` }}
                              title={`Day ${index + 1}: ${(value * 100).toFixed(1)}% uptime`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No historical data available yet
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Uptime tracking starts with your first check. Check this URL multiple times to build history.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Real uptime tracking builds history over time. Check URLs regularly to see detailed trends.</p>
        </div>
      </div>
    </div>
  )
}
