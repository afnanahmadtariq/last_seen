"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Shield, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle, Search, ExternalLink } from "lucide-react"

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

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<WebsiteProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles')
      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (error) {
      console.error('Failed to load profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedTab === "all") return matchesSearch
    if (selectedTab === "online") return matchesSearch && profile.analytics?.lastStatus === "online"
    if (selectedTab === "offline") return matchesSearch && profile.analytics?.lastStatus === "offline"
    if (selectedTab === "ssl-issues") return matchesSearch && profile.analytics?.sslStatus && profile.analytics.sslStatus.daysRemaining < 30
    
    return matchesSearch
  })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Loading Website Profiles...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">📊 Website Profiles</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Monitor and analyze website performance across all tracked sites</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search websites by URL, domain, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={loadProfiles} variant="outline">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for filtering */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Sites ({profiles.length})</TabsTrigger>
            <TabsTrigger value="online">
              Online ({profiles.filter(p => p.analytics?.lastStatus === "online").length})
            </TabsTrigger>
            <TabsTrigger value="offline">
              Offline ({profiles.filter(p => p.analytics?.lastStatus === "offline").length})
            </TabsTrigger>
            <TabsTrigger value="ssl-issues">
              SSL Issues ({profiles.filter(p => p.analytics?.sslStatus && p.analytics.sslStatus.daysRemaining < 30).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {filteredProfiles.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No websites match your search criteria." : "No websites tracked yet. Start by checking some URLs!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.map((profile) => (
                  <Card key={profile._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {profile.favicon && (
                            <img 
                              src={profile.favicon} 
                              alt="favicon" 
                              className="w-4 h-4 flex-shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-medium truncate">
                              {profile.title || profile.domain}
                            </CardTitle>
                            <CardDescription className="text-xs truncate">
                              {profile.url}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {getStatusIcon(profile.analytics?.lastStatus)}
                          <a 
                            href={profile.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Status and Uptime */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Status</span>
                          <Badge variant={profile.analytics?.lastStatus === "online" ? "default" : "destructive"}>
                            {profile.analytics?.lastStatus || "Unknown"}
                          </Badge>
                        </div>

                        {profile.analytics && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Uptime</span>
                              <Badge variant={getUptimeBadgeVariant(profile.analytics.overallUptime)}>
                                {profile.analytics.overallUptime.toFixed(1)}%
                              </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Avg Response</span>
                              <span className="text-xs font-mono">
                                {profile.analytics.avgResponseTime}ms
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Total Checks</span>
                              <span className="text-xs">{profile.analytics.totalChecks}</span>
                            </div>

                            {profile.analytics.sslStatus && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 dark:text-gray-400">SSL</span>
                                <Badge variant={getSSLBadgeVariant(profile.analytics.sslStatus.daysRemaining)}>
                                  {profile.analytics.sslStatus.daysRemaining} days
                                </Badge>
                              </div>
                            )}
                          </>
                        )}

                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>Last checked</span>
                            <span>{formatDate(profile.lastChecked)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Back to Main */}
        <div className="text-center mt-8">
          <Button onClick={() => window.location.href = '/'} variant="outline">
            ← Back to Website Checker
          </Button>
        </div>
      </div>
    </div>
  )
}
