"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, TrendingUp, AlertTriangle, Shield, Network, Target, Activity, Zap, Eye, BarChart3 } from "lucide-react"

interface AIInsights {
  overall_metrics?: any
  threat_assessment?: any[]
  emerging_patterns?: any[]
  ai_recommendations?: any[]
  system_health?: any
  alert_priorities?: any[]
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<AIInsights>({})
  const [biasEvolution, setBiasEvolution] = useState<any>(null)
  const [narrativeWarfare, setNarrativeWarfare] = useState<any>(null)
  const [influenceNetworks, setInfluenceNetworks] = useState<any>(null)
  const [predictiveModels, setPredictiveModels] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisType, setAnalysisType] = useState("comprehensive")

  useEffect(() => {
    loadAIInsights()
  }, [analysisType])

  const loadAIInsights = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/ai-insights?type=${analysisType}`)
      const result = await response.json()

      if (result.success) {
        switch (analysisType) {
          case "bias_evolution":
            setBiasEvolution(result.insights)
            break
          case "narrative_warfare":
            setNarrativeWarfare(result.insights)
            break
          case "influence_networks":
            setInfluenceNetworks(result.insights)
            break
          case "predictive_modeling":
            setPredictiveModels(result.insights)
            break
          default:
            setInsights(result.insights)
        }
      }
    } catch (error) {
      console.error("Error loading AI insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerRealTimeScraping = async () => {
    try {
      const response = await fetch("/api/real-time-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start_live_scraping" }),
      })
      const result = await response.json()

      if (result.success) {
        // Refresh insights after scraping
        loadAIInsights()
      }
    } catch (error) {
      console.error("Error triggering scraping:", error)
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "critical":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">AI Insights Engine</h1>
                <p className="text-sm text-gray-600">Advanced AI-powered analysis and predictive intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  <SelectItem value="bias_evolution">Bias Evolution</SelectItem>
                  <SelectItem value="narrative_warfare">Narrative Warfare</SelectItem>
                  <SelectItem value="influence_networks">Influence Networks</SelectItem>
                  <SelectItem value="predictive_modeling">Predictive Models</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={triggerRealTimeScraping} variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Live Scrape
              </Button>
              <Button onClick={loadAIInsights} disabled={isLoading}>
                {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Analyze
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* System Health Overview */}
        {insights.system_health && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <span>TruthGuard AI System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(insights.system_health.status)}`}
                  >
                    {insights.system_health.status.toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">System Status</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{(insights.system_health.score * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-600">Health Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{insights.system_health.metrics_analyzed}</p>
                  <p className="text-xs text-gray-600">Metrics Analyzed</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(insights.system_health.last_assessment).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-600">Last Assessment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
            <TabsTrigger value="patterns">Emerging Patterns</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="specialized">Specialized Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {insights.overall_metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Articles</p>
                        <p className="text-2xl font-bold">{insights.overall_metrics.total_articles}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Bias Score</p>
                        <p className="text-2xl font-bold">{(insights.overall_metrics.avg_bias * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">High Risk Articles</p>
                        <p className="text-2xl font-bold">{insights.overall_metrics.high_risk_count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Viral Score</p>
                        <p className="text-2xl font-bold">{(insights.overall_metrics.avg_viral * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI Recommendations Preview */}
            {insights.ai_recommendations && insights.ai_recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>Top AI Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.ai_recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{rec.type?.replace(/_/g, " ").toUpperCase()}</h4>
                          <Badge variant={rec.priority === "critical" ? "destructive" : "secondary"}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.message}</p>
                        <p className="text-xs text-blue-600 font-medium">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Threat Analysis Tab */}
          <TabsContent value="threats">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Threat Assessment */}
              {insights.threat_assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>Threat Assessment by Category</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.threat_assessment.slice(0, 6).map((threat, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{threat._id}</h4>
                            <Badge variant="destructive">{threat.threat_count} threats</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Threat Level:</span>
                              <span className="font-bold text-red-600">
                                {(threat.avg_threat_level * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={threat.avg_threat_level * 100} className="h-2" />
                            <div className="flex flex-wrap gap-1 mt-2">
                              {threat.sources?.slice(0, 3).map((source, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                              {threat.sources?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{threat.sources.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alert Priorities */}
              {insights.alert_priorities && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span>Priority Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.alert_priorities.map((alert, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium capitalize">{alert.category}</h4>
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(alert.priority)}`}></div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Threat Level:</span>
                              <span className="font-bold">{(alert.threat_level * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Affected Sources:</span>
                              <span>{alert.affected_sources}</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-2">{alert.recommended_response}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Emerging Patterns Tab */}
          <TabsContent value="patterns">
            {insights.emerging_patterns && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <span>Emerging Patterns Detection</span>
                  </CardTitle>
                  <CardDescription>AI-detected patterns in content emotions and timing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.emerging_patterns.map((pattern, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Hour {pattern._id.hour}:00</span>
                          <Badge variant="outline">{pattern.count} articles</Badge>
                        </div>
                        <div className="text-center mb-2">
                          <span className="text-2xl">
                            {pattern._id.emotion === "fear" && "😨"}
                            {pattern._id.emotion === "anger" && "😡"}
                            {pattern._id.emotion === "joy" && "😊"}
                            {pattern._id.emotion === "sadness" && "😢"}
                            {pattern._id.emotion === "surprise" && "😲"}
                            {!["fear", "anger", "joy", "sadness", "surprise"].includes(pattern._id.emotion) && "😐"}
                          </span>
                          <p className="text-sm font-medium capitalize">{pattern._id.emotion}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{(pattern.avg_viral * 100).toFixed(1)}%</p>
                          <p className="text-xs text-gray-600">Avg Viral Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations">
            {insights.ai_recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>AI-Powered Recommendations</span>
                  </CardTitle>
                  <CardDescription>Intelligent recommendations based on comprehensive analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {insights.ai_recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${getPriorityColor(rec.priority)}`}></div>
                            <h3 className="font-bold text-lg">{rec.type?.replace(/_/g, " ").toUpperCase()}</h3>
                          </div>
                          <Badge
                            variant={
                              rec.priority === "critical"
                                ? "destructive"
                                : rec.priority === "high"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {rec.priority} Priority
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Analysis:</h4>
                            <p className="text-gray-600">{rec.message}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Recommended Action:</h4>
                            <p className="text-blue-600 font-medium">{rec.action}</p>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Brain className="h-3 w-3" />
                            <span>AI Confidence: High</span>
                            <span>•</span>
                            <span>Generated: {new Date().toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Specialized Analysis Tab */}
          <TabsContent value="specialized">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bias Evolution Analysis</CardTitle>
                  <CardDescription>Track how bias patterns evolve over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setAnalysisType("bias_evolution")}
                    className="w-full"
                    variant={analysisType === "bias_evolution" ? "default" : "outline"}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze Bias Evolution
                  </Button>
                  {biasEvolution && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">Latest Analysis:</p>
                      <p className="text-xs text-gray-600">
                        Polarization Trend: {biasEvolution.polarization_trend?.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-600">
                        Echo Chambers Detected: {biasEvolution.echo_chambers?.length || 0}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Narrative Warfare Detection</CardTitle>
                  <CardDescription>Identify coordinated narrative campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setAnalysisType("narrative_warfare")}
                    className="w-full"
                    variant={analysisType === "narrative_warfare" ? "default" : "outline"}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Detect Narrative Warfare
                  </Button>
                  {narrativeWarfare && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium">Warfare Indicators:</p>
                      <p className="text-xs text-gray-600">
                        Threat Level: {narrativeWarfare.warfare_indicators?.threat_level}
                      </p>
                      <p className="text-xs text-gray-600">
                        Campaigns Detected: {narrativeWarfare.narrative_campaigns?.length || 0}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Influence Networks</CardTitle>
                  <CardDescription>Map influence relationships between sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setAnalysisType("influence_networks")}
                    className="w-full"
                    variant={analysisType === "influence_networks" ? "default" : "outline"}
                  >
                    <Network className="h-4 w-4 mr-2" />
                    Analyze Networks
                  </Button>
                  {influenceNetworks && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium">Network Analysis:</p>
                      <p className="text-xs text-gray-600">
                        Network Size: {influenceNetworks.network_metrics?.network_size}
                      </p>
                      <p className="text-xs text-gray-600">
                        Influence Clusters: {influenceNetworks.influence_clusters?.length || 0}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictive Models</CardTitle>
                  <CardDescription>AI models for content performance prediction</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setAnalysisType("predictive_modeling")}
                    className="w-full"
                    variant={analysisType === "predictive_modeling" ? "default" : "outline"}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Predictions
                  </Button>
                  {predictiveModels && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium">Model Performance:</p>
                      <p className="text-xs text-gray-600">Training Samples: {predictiveModels.training_data_size}</p>
                      <p className="text-xs text-gray-600">
                        AI Confidence: {(predictiveModels.ai_confidence?.overall_confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
