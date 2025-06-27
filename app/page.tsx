"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FullPageLoading } from "@/components/ui/loading"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Loader2, Globe, Shield, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle, User, LogOut } from "lucide-react"

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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return // Still loading
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return <FullPageLoading text="Initializing..." subText="Setting up your monitoring dashboard" />
  }

  if (!session) {
    return null // Will redirect to signin
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 glass dark:glass-dark border-b border-white/20 dark:border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center animate-fade-in">
              <div className="relative">
                <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse-soft"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  LastSeenPing
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Real-time monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 animate-fade-in">
              <ThemeToggle />
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="relative inline-block mb-6">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
              Website Monitoring Dashboard
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Real-time website monitoring with uptime tracking, SSL certificate validation, and performance analytics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => window.location.href = '/profiles'} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              📊 View All Profiles
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Live monitoring active
            </div>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-8 animate-scale-in glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              Website Checker
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300">
              Enter a website URL to check its real-time status, SSL certificate, and uptime history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCheck()}
                className="flex-1 h-12 text-lg bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={loading}
              />
              <Button 
                onClick={handleCheck} 
                disabled={loading} 
                className="min-w-[140px] h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-5 w-5" />
                    Check Status
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="grid gap-6 md:grid-cols-2 animate-slide-up">
            {/* Server Status Card */}
            <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <div className={`p-2 rounded-lg ${result.status === "online" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {getStatusIcon(result.status)}
                  </div>
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                    <Badge 
                      variant={result.status === "online" ? "default" : "destructive"}
                      className={`${result.status === "online" ? "shadow-glow-green" : "shadow-glow-red"} font-medium`}
                    >
                      {result.status === "online" ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  {result.statusCode && (
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">HTTP Status</span>
                      <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{result.statusCode}</span>
                    </div>
                  )}
                  {result.responseTime && (
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</span>
                      <span className="font-mono text-sm font-bold text-green-600 dark:text-green-400">{result.responseTime}ms</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Last Modified Card */}
            <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Last Content Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {result.lastModified ? "Last modified" : "Status"}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {result.lastModified ? formatDate(result.lastModified) : "No data available"}
                    </p>
                    {!result.lastModified && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Site may not provide last-modified headers
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SSL Certificate Card */}
            <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  SSL Certificate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.sslExpiry ? (
                    <>
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Expires</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(result.sslExpiry)}</span>
                      </div>
                      {result.sslDaysRemaining !== undefined && (
                        <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Days remaining</span>
                          <Badge 
                            variant={getSSLBadgeVariant(result.sslDaysRemaining)}
                            className={`font-medium ${
                              result.sslDaysRemaining < 7 ? "shadow-glow-red" :
                              result.sslDaysRemaining < 30 ? "shadow-glow" :
                              "shadow-glow-green"
                            }`}
                          >
                            {result.sslDaysRemaining} days
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
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
            <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Uptime History (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.uptime ? (
                    <>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</span>
                          <Badge 
                            variant={result.uptime.percentage > 95 ? "default" : result.uptime.percentage > 90 ? "secondary" : "destructive"}
                            className={`font-medium ${
                              result.uptime.percentage > 95 ? "shadow-glow-green" :
                              result.uptime.percentage > 90 ? "shadow-glow" :
                              "shadow-glow-red"
                            }`}
                          >
                            {result.uptime.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Checks</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{result.uptime.successfulChecks}/{result.uptime.totalChecks}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Daily trend (30 days)</span>
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex gap-1 h-12 items-end">
                            {result.uptime.trend.map((value: number, index: number) => (
                              <div
                                key={index}
                                className={`flex-1 rounded-sm transition-all duration-300 hover:scale-110 ${
                                  value > 0.95 ? 'bg-gradient-to-t from-green-400 to-green-500 dark:from-green-600 dark:to-green-500' :
                                  value > 0.8 ? 'bg-gradient-to-t from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-500' :
                                  value > 0 ? 'bg-gradient-to-t from-red-400 to-red-500 dark:from-red-600 dark:to-red-500' :
                                  'bg-gradient-to-t from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600'
                                }`}
                                style={{ height: `${Math.max(value * 100, 8)}%` }}
                                title={`Day ${index + 1}: ${(value * 100).toFixed(1)}% uptime`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
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
        <div className="mt-16 text-center animate-fade-in">
          <div className="p-6 glass dark:glass-dark rounded-xl border-white/20 dark:border-gray-800/50 shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
              Real uptime tracking builds history over time
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Check URLs regularly to see detailed trends and analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
