"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { FullPageLoading } from "@/components/ui/loading"
import { Globe, Shield, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle, Search, ExternalLink, User, LogOut, Loader2, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"

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
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<WebsiteProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [deletingProfile, setDeletingProfile] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return // Still loading
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
    
    loadProfiles()
  }, [session, status, router])

  if (status === "loading") {
    return <FullPageLoading text="Authenticating..." subText="Verifying your access" />
  }

  if (!session) {
    return null 
  }
  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles')
      
      if (response.status === 401) {
        router.push("/auth/signin")
        return
      }
      
      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (error) {
      console.error('Failed to load profiles:', error)
    } finally {
      setLoading(false)
    }
  }
  const deleteProfile = async (url: string) => {
    try {
      setDeletingProfile(url)
      
      const response = await fetch('/api/profiles', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      if (response.status === 401) {
        router.push("/auth/signin")
        return
      }
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete profile')
      }
      
      // Remove the profile from the local state
      setProfiles(profiles.filter(profile => profile.url !== url))
      
      // Show success message
      toast({
        title: "Profile deleted",
        description: `Successfully deleted profile for ${url}`,
        variant: "default",
      })
      
    } catch (error) {
      console.error('Failed to delete profile:', error)
      
      // Show error message
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete website profile",
        variant: "destructive",
      })
    } finally {
      setDeletingProfile(null)
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
    return <FullPageLoading text="Loading Website Profiles..." subText="Fetching your monitored websites" />
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Card className="mb-8 glass dark:glass-dark border-gray-300/50 dark:border-gray-800/50 shadow-xl animate-scale-in">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search websites by URL, domain, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <Button 
                onClick={loadProfiles} 
                variant="outline"
                className="bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
              >
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for filtering */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6 ">
          <TabsList className="grid w-full grid-cols-4 bg-gray-200/80 dark:bg-gray-800/60">
            <TabsTrigger value="all">
              All Sites ({profiles.length})
            </TabsTrigger>
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
              <Card className="bg-white/20 dark:bg-gray-800/60">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400 ">
                    {searchTerm ? "No websites match your search criteria." : "No websites tracked yet. Start by checking some URLs!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles.map((profile) => (
                  <Card key={profile._id} className="hover:shadow-lg transition-shadow bg-white/20 dark:bg-gray-800/60">
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
                        )}                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>Last checked</span>
                            <span>{formatDate(profile.lastChecked)}</span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="pt-2 border-t">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                disabled={deletingProfile === profile.url}
                              >
                                {deletingProfile === profile.url ? (
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
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Website Profile</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the profile for <strong>{profile.url}</strong>?
                                  <br /><br />
                                  This will permanently remove:
                                  <div className="mt-2 space-y-1">
                                    <ul className="list-disc list-inside">
                                      <li>All check history</li>
                                      <li>Performance analytics</li>
                                      <li>Uptime statistics</li>
                                    </ul>
                                  </div>
                                  <br />
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProfile(profile.url)}
                                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                >
                                  Delete Profile
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
        <div className="text-center mt-8 ">
          <Button onClick={() => window.location.href = '/'} variant="outline" className="bg-white/20 dark:bg-gray-800/60">
            ← Back to Website Checker
          </Button>
        </div>
      </div>
    </div>
  )
}
