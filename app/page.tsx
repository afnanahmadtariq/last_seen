"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FullPageLoading } from "@/components/ui/loading"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { WebsiteResultsModal } from "@/components/ui/website-results-modal"
import { QuickResultsPreview } from "@/components/ui/quick-results-preview"
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
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState("")
  const [showResultsModal, setShowResultsModal] = useState(false)

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
    setShowResultsModal(false)

    try {
      const response = await fetch(`/api/check?url=${encodeURIComponent(formattedUrl)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check website")
      }

      setResult(data)
      // Don't auto-open modal, show preview first
      // setShowResultsModal(true)
      
      // Show success toast
      toast({
        title: "Website checked successfully!",
        description: `${formattedUrl} is ${data.status}`,
        variant: data.status === "online" ? "default" : "destructive",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
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
        <Card className={`mb-8 animate-scale-in glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl ${result ? 'ring-2 ring-blue-500/20' : ''}`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              Website Checker
              {result && (
                <Badge variant="outline" className="ml-auto">
                  Last checked: {new URL(result.url).hostname}
                </Badge>
              )}
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

        {/* Quick Results Preview */}
        {result && !showResultsModal && (
          <QuickResultsPreview 
            result={result}
            onViewDetails={() => setShowResultsModal(true)}
            onCheckAnother={() => {
              setResult(null)
              setUrl("")
            }}
          />
        )}

        {/* Results Modal */}
        {result && (
          <WebsiteResultsModal 
            result={result}
            isOpen={showResultsModal}
            onClose={() => {
              setShowResultsModal(false)
              // Optionally clear the result after closing
              // setResult(null)
            }}
          />
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
