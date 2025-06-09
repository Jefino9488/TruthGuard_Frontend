"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Database,
  Cpu,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react"

interface RealTimeUpdate {
  type: string
  data?: any
  message?: string
  timestamp: string
  stats?: {
    total_processed: number
    bias_detected: number
    misinformation_flagged: number
    high_credibility: number
    processing_rate: number
    vector_searches: number
  }
}

export default function RealTimePage() {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [stats, setStats] = useState({
    total_processed: 0,
    bias_detected: 0,
    misinformation_flagged: 0,
    high_credibility: 0,
    processing_rate: 0,
    vector_searches: 0,
  })
  const [systemStatus, setSystemStatus] = useState({
    mongodb_status: "connecting",
    vector_search_status: "connecting",
    google_ai_status: "connecting",
    real_time_processing: "connecting",
  })

  useEffect(() => {
    if (isPaused) return

    const eventSource = new EventSource("/api/realtime")

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const update: RealTimeUpdate = JSON.parse(event.data)

        setUpdates((prev) => [update, ...prev.slice(0, 49)]) // Keep last 50 updates

        if (update.stats) {
          setStats(update.stats)
        }

        if (update.data?.processing_pipeline) {
          setSystemStatus(update.data.processing_pipeline)
        }
      } catch (error) {
        console.error("Failed to parse real-time update:", error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [isPaused])

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const triggerNewsScraping = async () => {
    try {
      const response = await fetch("/api/news-scraper", {
        method: "GET",
      })
      const result = await response.json()

      if (result.success) {
        // Add a manual update to show scraping results
        const scrapingUpdate: RealTimeUpdate = {
          type: "news_scraping",
          message: `Successfully scraped ${result.total_articles} new articles from ${result.sources_processed} sources`,
          timestamp: new Date().toISOString(),
          data: {
            articles: result.articles,
          },
        }
        setUpdates((prev) => [scrapingUpdate, ...prev.slice(0, 49)])
      }
    } catch (error) {
      console.error("Failed to trigger news scraping:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "operational":
      case "running":
      case "active":
        return "bg-green-500"
      case "connecting":
      case "starting":
        return "bg-yellow-500 animate-pulse"
      default:
        return "bg-red-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
      case "operational":
      case "running":
      case "active":
        return "Online"
      case "connecting":
      case "starting":
        return "Starting"
      default:
        return "Offline"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">TruthGuard Real-Time Dashboard</h1>
                <p className="text-sm text-gray-600">Live MongoDB Vector Search & AI Analysis Pipeline</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                ></div>
                <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
              <Button variant="outline" size="sm" onClick={triggerNewsScraping}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Scrape News
              </Button>
              <Button variant="outline" size="sm" onClick={togglePause}>
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-blue-600" />
                <span>MongoDB Atlas & AI Pipeline Status</span>
              </CardTitle>
              <CardDescription>
                Real-time monitoring of TruthGuard's core systems and processing pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* System Components Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.mongodb_status)}`}></div>
                      <span className="font-medium">MongoDB Atlas</span>
                    </div>
                    <span className="text-sm text-gray-600">{getStatusText(systemStatus.mongodb_status)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Search className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.vector_search_status)}`}
                      ></div>
                      <span className="font-medium">Vector Search</span>
                    </div>
                    <span className="text-sm text-gray-600">{getStatusText(systemStatus.vector_search_status)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Cpu className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.google_ai_status)}`}></div>
                      <span className="font-medium">Google AI</span>
                    </div>
                    <span className="text-sm text-gray-600">{getStatusText(systemStatus.google_ai_status)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.real_time_processing)}`}
                      ></div>
                      <span className="font-medium">Real-time Processing</span>
                    </div>
                    <span className="text-sm text-gray-600">{getStatusText(systemStatus.real_time_processing)}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total_processed.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Articles Processed</div>
                  <Progress value={75} className="h-1 mt-2" />
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.bias_detected.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Bias Detected</div>
                  <Progress value={60} className="h-1 mt-2" />
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.misinformation_flagged.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Misinformation Flagged</div>
                  <Progress value={25} className="h-1 mt-2" />
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.high_credibility.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">High Credibility</div>
                  <Progress value={85} className="h-1 mt-2" />
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.processing_rate}</div>
                  <div className="text-sm text-gray-600">Articles/Hour</div>
                  <Progress value={90} className="h-1 mt-2" />
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{stats.vector_searches.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Vector Searches</div>
                  <Progress value={70} className="h-1 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Live Activity Stream</CardTitle>
              <CardDescription>Real-time processing updates, MongoDB operations, and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All Updates</TabsTrigger>
                  <TabsTrigger value="processing">Processing</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="vector">Vector Search</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {updates.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {isPaused ? "Feed paused - click Resume to continue" : "Waiting for updates..."}
                      </div>
                    ) : (
                      updates.map((update, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="mt-1">
                            {update.type === "connection" ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : update.type === "comprehensive_update" ? (
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                            ) : update.type === "alert" ? (
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            ) : update.type === "vector_search_activity" ? (
                              <Search className="h-5 w-5 text-purple-600" />
                            ) : update.type === "news_scraping" ? (
                              <RefreshCw className="h-5 w-5 text-orange-600" />
                            ) : (
                              <Activity className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">
                                {update.type === "connection" && "System Connected"}
                                {update.type === "comprehensive_update" && "Processing Update"}
                                {update.type === "alert" && "High Risk Alert"}
                                {update.type === "vector_search_activity" && "Vector Search Activity"}
                                {update.type === "news_scraping" && "News Scraping Complete"}
                                {update.type === "error" && "System Notice"}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(update.timestamp).toLocaleTimeString()}
                                </span>
                                {update.type === "comprehensive_update" && (
                                  <Badge variant="outline" className="text-xs">
                                    Live
                                  </Badge>
                                )}
                                {update.type === "vector_search_activity" && (
                                  <Badge variant="outline" className="text-xs bg-purple-50">
                                    Vector
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {update.message ||
                                (update.type === "comprehensive_update"
                                  ? `${update.data?.articles?.length || 0} articles processed with MongoDB Vector Search`
                                  : "System update")}
                            </p>

                            {/* Enhanced update details */}
                            {update.data?.articles && update.data.articles.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {update.data.articles.slice(0, 3).map((article: any, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {article.source}
                                    </Badge>
                                  ))}
                                  {update.data.articles.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{update.data.articles.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Latest: "{update.data.articles[0]?.title?.substring(0, 60)}..."
                                </div>
                              </div>
                            )}

                            {/* Alert details */}
                            {update.data?.alerts && update.data.alerts.length > 0 && (
                              <div className="mt-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                                <div className="text-sm font-medium text-red-800">
                                  {update.data.alerts.length} high-risk article(s) detected
                                </div>
                                <div className="text-xs text-red-600 mt-1">
                                  {update.data.alerts[0]?.title?.substring(0, 80)}...
                                </div>
                              </div>
                            )}

                            {/* Vector search details */}
                            {update.type === "vector_search_activity" && update.data && (
                              <div className="mt-2 p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                                <div className="text-sm font-medium text-purple-800">
                                  Vector search performed on {update.data.length} documents
                                </div>
                                <div className="text-xs text-purple-600 mt-1">
                                  MongoDB Atlas Vector Search with AI embeddings
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="processing" className="mt-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {updates
                      .filter((u) => u.type === "comprehensive_update" || u.type === "news_scraping")
                      .map((update, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {update.type === "news_scraping" ? "News Scraping" : "Processing Batch"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>Articles: {update.data?.articles?.length || 0}</div>
                            <div>Rate: {update.stats?.processing_rate || 0}/hr</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="mt-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {updates
                      .filter((u) => u.type === "alert")
                      .map((update, index) => (
                        <div key={index} className="p-4 border rounded-lg border-red-200 bg-red-50">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-800">High Risk Detection</span>
                            <span className="text-xs text-red-600">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-red-700">
                            {update.data?.alerts?.length || 0} articles flagged for review
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="vector" className="mt-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {updates
                      .filter((u) => u.type === "vector_search_activity")
                      .map((update, index) => (
                        <div key={index} className="p-4 border rounded-lg border-purple-200 bg-purple-50">
                          <div className="flex items-center space-x-2 mb-2">
                            <Search className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-800">Vector Search Activity</span>
                            <span className="text-xs text-purple-600">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-purple-700">
                            MongoDB Atlas Vector Search performed on {update.data?.length || 0} documents
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="system" className="mt-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {updates
                      .filter((u) => u.type === "connection" || u.type === "error")
                      .map((update, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            {update.type === "connection" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="font-medium">System Event</span>
                            <span className="text-xs text-gray-500">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">{update.message}</div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
