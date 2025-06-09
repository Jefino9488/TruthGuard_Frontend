"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Database, Search, BarChart3, Zap, Brain, Globe } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function MongoDBShowcasePage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [vectorSearchResults, setVectorSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/mongodb-analytics")
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  const performVectorSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/mongodb?q=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await response.json()
      if (data.success) {
        setVectorSearchResults(data.data)
      }
    } catch (error) {
      console.error("Vector search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Database className="h-10 w-10 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                TruthGuard × MongoDB
              </h1>
              <p className="text-gray-600">AI-Powered Media Analysis with MongoDB's Intelligent Data Platform</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* MongoDB Features Showcase */}
        <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-green-600" />
              <span>MongoDB Features Demonstrated</span>
            </CardTitle>
            <CardDescription>
              TruthGuard leverages MongoDB's advanced capabilities for real-world media bias detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg bg-white">
                <Search className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Vector Search</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Semantic similarity search using AI-generated embeddings for intelligent content discovery
                </p>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Atlas Vector Search
                </Badge>
              </div>

              <div className="text-center p-6 border rounded-lg bg-white">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Aggregation Pipeline</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Complex analytics and data transformations for bias pattern analysis
                </p>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Advanced Analytics
                </Badge>
              </div>

              <div className="text-center p-6 border rounded-lg bg-white">
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Real-time Processing</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Live data ingestion and analysis with change streams and real-time updates
                </p>
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  Change Streams
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vector Search Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-green-600" />
              <span>MongoDB Vector Search Demo</span>
            </CardTitle>
            <CardDescription>
              Search news articles using semantic similarity with AI-generated embeddings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <input
                type="text"
                placeholder="Search for news topics (e.g., 'climate change policy', 'election fraud claims')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === "Enter" && performVectorSearch()}
              />
              <Button onClick={performVectorSearch} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? "Searching..." : "Vector Search"}
              </Button>
            </div>

            {vectorSearchResults.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Search Results (Semantic Similarity)</h4>
                {vectorSearchResults.map((article, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-lg">{article.title}</h5>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{article.source}</Badge>
                        {article.vectorSearchScore && (
                          <Badge variant="secondary">Similarity: {(article.vectorSearchScore * 100).toFixed(1)}%</Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Bias Score:</span>
                        <Progress value={article.bias_score * 100} className="h-2 mt-1" />
                      </div>
                      <div>
                        <span className="font-medium">Credibility:</span>
                        <Progress value={article.credibility_score * 100} className="h-2 mt-1" />
                      </div>
                      <div>
                        <span className="font-medium">Risk Level:</span>
                        <Progress value={article.misinformation_risk * 100} className="h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview Analytics</TabsTrigger>
            <TabsTrigger value="bias">Bias Trends</TabsTrigger>
            <TabsTrigger value="sources">Source Analysis</TabsTrigger>
            <TabsTrigger value="topics">Topic Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalStats?.[0]?.totalArticles?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">Processed with MongoDB</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Bias Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((analytics?.totalStats?.[0]?.avgBias || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Aggregation pipeline</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Sources</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalStats?.[0]?.uniqueSources?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Distinct values</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Topics Covered</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalStats?.[0]?.uniqueTopics?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">AI categorized</p>
                </CardContent>
              </Card>
            </div>

            {/* Bias Distribution Chart */}
            {analytics?.biasDistribution && (
              <Card>
                <CardHeader>
                  <CardTitle>Bias Distribution (MongoDB Bucketing)</CardTitle>
                  <CardDescription>Articles categorized by bias levels using MongoDB aggregation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.biasDistribution.map((item: any, index: number) => ({
                          name: `Bias ${item._id === 0 ? "Low (0-0.3)" : item._id === 0.3 ? "Medium (0.3-0.6)" : "High (0.6-1.0)"}`,
                          value: item.count,
                          fill: COLORS[index % COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.biasDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bias" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bias Trends Over Time</CardTitle>
                <CardDescription>MongoDB time series analysis of bias patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.biasTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgBias" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="highBiasCount" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Comparison</CardTitle>
                <CardDescription>MongoDB aggregation analysis of news sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.sourceAnalysis?.slice(0, 6).map((source: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{source._id}</h4>
                        <Badge variant="outline">{source.articleCount} articles</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Avg Bias</span>
                          <Progress value={source.avgBias * 100} className="h-2 mt-1" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Credibility</span>
                          <Progress value={source.avgCredibility * 100} className="h-2 mt-1" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Risk Level</span>
                          <Progress value={source.avgMisinfoRisk * 100} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Topic Analysis</CardTitle>
                <CardDescription>AI-categorized topics with MongoDB analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics?.topicTrends?.slice(0, 6).map((topic: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold capitalize">{topic._id}</h4>
                        <Badge variant="outline">{topic.count} articles</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg Bias:</span>
                          <span>{(topic.avgBias * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Sentiment:</span>
                          <span className={topic.avgSentiment > 0 ? "text-green-600" : "text-red-600"}>
                            {topic.avgSentiment > 0 ? "+" : ""}
                            {(topic.avgSentiment * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Sources:</span>
                          <span>{topic.sources?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MongoDB Technical Implementation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>MongoDB Technical Implementation</CardTitle>
            <CardDescription>How TruthGuard leverages MongoDB's intelligent data platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Data Processing Pipeline</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>News article ingestion with duplicate detection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>AI analysis integration with Google Cloud</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Vector embedding generation and storage</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Real-time analytics with aggregation pipelines</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">MongoDB Features Used</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline">Atlas Vector Search</Badge>
                  <Badge variant="outline">Aggregation Pipeline</Badge>
                  <Badge variant="outline">Change Streams</Badge>
                  <Badge variant="outline">Atlas Search</Badge>
                  <Badge variant="outline">Time Series</Badge>
                  <Badge variant="outline">Faceted Search</Badge>
                  <Badge variant="outline">Bucketing</Badge>
                  <Badge variant="outline">Statistical Ops</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
