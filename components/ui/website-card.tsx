"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Trash2, Loader2, Shield, Clock, TrendingUp } from "lucide-react"

interface WebsiteProfile {
  _id: string
  url: string
  domain: string
  title?: string
  description?: string
  favicon?: string
  firstSeen: string
  lastChecked: string
  analytics?: {
    totalChecks: number
    overallUptime: number
    avgResponseTime: number
    lastStatus: 'online' | 'offline'
    consecutiveDowntime: number
    sslStatus?: {
      valid: boolean
      expiry: string
      daysRemaining: number
    }
  }
}

interface WebsiteCardProps {
  profile: WebsiteProfile
  onDelete: (url: string) => void
  isDeleting: boolean
}

export function WebsiteCard({ profile, onDelete, isDeleting }: WebsiteCardProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getUptimeBadgeVariant = (uptime: number) => {
    if (uptime >= 99) return "default"
    if (uptime >= 95) return "secondary"
    return "destructive"
  }

  const getSSLBadgeVariant = (daysRemaining?: number) => {
    if (!daysRemaining) return "secondary"
    if (daysRemaining < 7) return "destructive"
    if (daysRemaining < 30) return "default"
    return "secondary"
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  return (
    <Card className="group glass dark:glass-dark border-white/20 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-scale-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {profile.favicon && (
              <div className="flex-shrink-0 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <img 
                  src={profile.favicon} 
                  alt="favicon" 
                  className="w-4 h-4"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {profile.title || profile.domain}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {profile.url}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusIcon(profile.analytics?.lastStatus)}
            <a 
              href={profile.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-target"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</div>
            <Badge 
              variant={profile.analytics?.lastStatus === "online" ? "default" : "destructive"}
              className={`text-xs ${
                profile.analytics?.lastStatus === "online" ? "shadow-glow-green" : "shadow-glow-red"
              }`}
            >
              {profile.analytics?.lastStatus || "Unknown"}
            </Badge>
          </div>
          
          {profile.analytics && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Uptime</div>
              <Badge 
                variant={getUptimeBadgeVariant(profile.analytics.overallUptime)}
                className={`text-xs ${
                  profile.analytics.overallUptime > 95 ? "shadow-glow-green" :
                  profile.analytics.overallUptime > 90 ? "shadow-glow" :
                  "shadow-glow-red"
                }`}
              >
                {profile.analytics.overallUptime.toFixed(1)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        {profile.analytics && (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Response
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {profile.analytics.avgResponseTime}ms
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Checks
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {profile.analytics.totalChecks}
              </span>
            </div>

            {profile.analytics.sslStatus && (
              <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  SSL
                </span>
                <Badge 
                  variant={getSSLBadgeVariant(profile.analytics.sslStatus.daysRemaining)}
                  className={`text-xs ${
                    profile.analytics.sslStatus.daysRemaining < 7 ? "shadow-glow-red" :
                    profile.analytics.sslStatus.daysRemaining < 30 ? "shadow-glow" :
                    "shadow-glow-green"
                  }`}
                >
                  {profile.analytics.sslStatus.daysRemaining} days
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Last Checked */}
        <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Last checked</span>
            <span>{formatDate(profile.lastChecked)}</span>
          </div>
        </div>

        {/* Delete Button */}
        <div className="pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700 transition-all duration-200"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete Profile
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass dark:glass-dark border-white/20 dark:border-gray-800/50">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Website Profile</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the profile for <strong>{profile.domain}</strong>? 
                  This action cannot be undone and will remove all monitoring history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(profile.url)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Profile
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
