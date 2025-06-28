"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Eye, Globe } from "lucide-react"

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

interface QuickResultsPreviewProps {
  result: CheckResult
  onViewDetails: () => void
  onCheckAnother?: () => void
}

export function QuickResultsPreview({ result, onViewDetails, onCheckAnother }: QuickResultsPreviewProps) {
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

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  return (
    <Card className="mb-6 glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-xl animate-slide-up">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(result.status)}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {getDomainFromUrl(result.url)}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <Badge 
                  variant={result.status === "online" ? "default" : "destructive"}
                  className={`${result.status === "online" ? "shadow-glow-green" : "shadow-glow-red"}`}
                >
                  {result.status === "online" ? "Online" : "Offline"}
                </Badge>
                {result.responseTime && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {result.responseTime}ms
                  </span>
                )}
                {result.statusCode && (
                  <span className="font-mono font-medium">
                    {result.statusCode}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onCheckAnother && (
              <Button
                variant="outline"
                onClick={onCheckAnother}
                className="bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
              >
                Check Another
              </Button>
            )}
            <Button
              onClick={onViewDetails}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
