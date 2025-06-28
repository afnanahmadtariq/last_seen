"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Globe, 
  Shield, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Download,
  Share,
  X
} from "lucide-react"

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

interface WebsiteResultsModalProps {
  result: CheckResult
  isOpen: boolean
  onClose: () => void
}

export function WebsiteResultsModal({ result, isOpen, onClose }: WebsiteResultsModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Add keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

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
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getSSLBadgeVariant = (daysRemaining?: number) => {
    if (!daysRemaining) return "secondary"
    if (daysRemaining < 7) return "destructive"
    if (daysRemaining < 30) return "default"
    return "secondary"
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(result.url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Website Status: ${result.url}`,
          text: `Check out the status of ${result.url} - ${result.status}`,
          url: result.url,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      copyUrl()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(result.status)}
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Website Analysis Complete
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
                  Detailed monitoring results for your website
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Website Header */}
            <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {result.url}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Real-time monitoring results
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyUrl}
                      className="bg-white/50 dark:bg-gray-800/50"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedUrl ? "Copied!" : "Copy URL"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareUrl}
                      className="bg-white/50 dark:bg-gray-800/50"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      className="bg-white/50 dark:bg-gray-800/50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Server Status */}
              <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className={`p-2 rounded-lg ${result.status === "online" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                      {getStatusIcon(result.status)}
                    </div>
                    Server Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>

              {/* Last Modified */}
              <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Last Content Update
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* SSL Certificate */}
              <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    SSL Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>

              {/* Uptime History */}
              <Card className="glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Uptime History (30 days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          <div className="flex gap-1 h-16 items-end">
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
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => window.location.href = '/profiles'}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-1"
              >
                📊 View All Profiles
              </Button>
              <Button 
                variant="outline"
                onClick={onClose}
                className="bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 flex-1"
              >
                Check Another Website
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
