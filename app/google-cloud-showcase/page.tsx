"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cloud, Brain, Database, Zap, Target, BarChart3, Shield, Cpu, Globe, Sparkles } from "lucide-react"

export default function GoogleCloudShowcasePage() {
  const [selectedDataset, setSelectedDataset] = useState("sample_mflix")
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [googleAIResults, setGoogleAIResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testContent, setTestContent] = useState(
    "Breaking: Revolutionary AI technology promises to transform how we detect misinformation in real-time, offering unprecedented accuracy in identifying bias and emotional manipulation across digital platforms.",
  )

  const datasets = [
    { value: "sample_mflix", label: "Movies Dataset", description: "Movie plots and ratings analysis" },
    { value: "sample_airbnb", label: "Airbnb Dataset", description: "Property reviews and sentiment" },
    { value: "sample_restaurants", label: "Restaurants Dataset", description: "Restaurant reviews and ratings" },
    { value: "sample_training", label: "Training Dataset", description: "Social media posts analysis" },
    { value: "truthguard", label: "TruthGuard Dataset", description: "News articles with AI analysis" },
  ]

  const loadDatasetAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/mongodb-datasets?dataset=${selectedDataset}&limit=8`)
      const result = await response.json()

      if (result.success) {
        setAnalysisResults(result)
      }
    } catch (error) {
      console.error("Error loading dataset analysis:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testGoogleAI = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/google-ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: testContent,
          dataset_type: "news",
          analysis_type: "comprehensive",
        }),
      })
      const result = await response.json()

      if (result.success) {
        setGoogleAIResults(result)
      }
    } catch (error) {
      console.error("Error testing Google AI:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDatasetAnalysis()
  }, [selectedDataset])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Cloud className="h-10 w-10 text-blue-600" />
              <Database className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                TruthGuard × Google Cloud × MongoDB
              </h1>
              <p className="text-gray-600">
                AI-Powered Misinformation Detection with Google Cloud AI and MongoDB Atlas
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Partnership Showcase */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <span>Hackathon Partnership Showcase</span>
            </CardTitle>
            <CardDescription>
              Demonstrating the power of Google Cloud AI + MongoDB integration for real-world impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg bg-white">
                <Cloud className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Google Cloud AI</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Gemini 1.5 Pro for advanced content analysis, bias detection, and misinformation scoring
                </p>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                    Gemini 1.5 Pro
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                    Vertex AI
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                    Natural Language AI
                  </Badge>
                </div>
              </div>

              <div className="text-center p-6 border rounded-lg bg-white">
                <Database className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">MongoDB Atlas</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Vector search, aggregation pipelines, and real-time analytics for intelligent data processing
                </p>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    Vector Search
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    Aggregation Pipeline
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    Atlas Search
                  </Badge>
                </div>
              </div>

              <div className="text-center p-6 border rounded-lg bg-white">
                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">TruthGuard Platform</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Real-time misinformation detection combining AI analysis with public dataset insights
                </p>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs">
                    Bias Detection
                  </Badge>
                  <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs">
                    Viral Prediction
                  </Badge>
                  <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs">
                    Real-time Analysis
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="google-ai" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="google-ai">Google Cloud AI</TabsTrigger>
            <TabsTrigger value="datasets">MongoDB Datasets</TabsTrigger>
            <TabsTrigger value="integration">AI + MongoDB</TabsTrigger>
            <TabsTrigger value="impact">Real-World Impact</TabsTrigger>
          </TabsList>

          {/* Google Cloud AI Tab */}
          <TabsContent value="google-ai">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span>Google Cloud AI Analysis</span>
                  </CardTitle>
                  <CardDescription>Test Gemini 1.5 Pro with real content analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Test Content:</label>
                      <textarea
                        value={testContent}
                        onChange={(e) => setTestContent(e.target.value)}
                        className="w-full mt-1 p-3 border rounded-lg h-32 text-sm"
                        placeholder="Enter content to analyze with Google Cloud AI..."
                      />
                    </div>
                    <Button
                      onClick={testGoogleAI}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? <Cpu className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                      Analyze with Gemini 1.5 Pro
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Google AI Results */}
              {googleAIResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <span>AI Analysis Results</span>
                    </CardTitle>
                    <CardDescription>Google Cloud AI powered insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-600">
                            {(googleAIResults.google_cloud_ai?.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-600">AI Confidence</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-lg font-bold text-green-600">
                            {googleAIResults.mongodb_integration?.vector_search_results || 0}
                          </p>
                          <p className="text-xs text-gray-600">Vector Matches</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Key Insights:</h4>
                        {googleAIResults.enhanced_insights?.key_insights?.slice(0, 3).map((insight, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                            <span className="font-medium">{insight.type}:</span> {insight.insight}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {googleAIResults.platform_features &&
                          Object.entries(googleAIResults.platform_features).map(([feature, enabled]) => (
                            <Badge key={feature} variant={enabled ? "default" : "outline"} className="text-xs">
                              {feature.replace(/_/g, " ")}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* MongoDB Datasets Tab */}
          <TabsContent value="datasets">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-green-600" />
                    <span>MongoDB Public Datasets Analysis</span>
                  </CardTitle>
                  <CardDescription>Explore and analyze MongoDB sample datasets with AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {datasets.map((dataset) => (
                          <SelectItem key={dataset.value} value={dataset.value}>
                            {dataset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={loadDatasetAnalysis} disabled={isLoading} variant="outline">
                      {isLoading ? (
                        <Cpu className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <BarChart3 className="h-4 w-4 mr-2" />
                      )}
                      Analyze Dataset
                    </Button>
                  </div>

                  {analysisResults && (
                    <div className="space-y-6">
                      {/* Dataset Info */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-bold text-green-800">{analysisResults.dataset_info?.name}</h3>
                        <p className="text-sm text-green-700 mb-2">{analysisResults.dataset_info?.description}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span>
                            <strong>Documents:</strong>{" "}
                            {analysisResults.dataset_info?.total_documents?.toLocaleString()}
                          </span>
                          <span>
                            <strong>Use Case:</strong> {analysisResults.dataset_info?.use_case}
                          </span>
                        </div>
                      </div>

                      {/* Analysis Results */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisResults.results?.slice(0, 6).map((result, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">
                                {typeof result._id === "object" ? Object.values(result._id).join(" • ") : result._id}
                              </h4>
                              <Badge variant="outline">{result.count} items</Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              {result.avg_rating && (
                                <div className="flex justify-between">
                                  <span>Avg Rating:</span>
                                  <span className="font-medium">{result.avg_rating.toFixed(1)}</span>
                                </div>
                              )}
                              {result.avg_bias && (
                                <div className="flex justify-between">
                                  <span>Avg Bias:</span>
                                  <span className="font-medium">{(result.avg_bias * 100).toFixed(1)}%</span>
                                </div>
                              )}
                              {result.avg_credibility && (
                                <div className="flex justify-between">
                                  <span>Credibility:</span>
                                  <span className="font-medium">{(result.avg_credibility * 100).toFixed(1)}%</span>
                                </div>
                              )}
                              {result.bias_indicators && (
                                <div className="flex justify-between">
                                  <span>Bias Indicators:</span>
                                  <span className="font-medium text-orange-600">{result.bias_indicators}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Google AI Insights */}
                      {analysisResults.google_ai_insights && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Google AI Dataset Insights</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {analysisResults.google_ai_insights.google_ai_insights?.map((insight, index) => (
                                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-blue-800 capitalize">
                                      {insight.type.replace(/_/g, " ")}
                                    </span>
                                    <Badge variant="outline" className="text-blue-600">
                                      {(insight.confidence * 100).toFixed(0)}% confidence
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-blue-700">{insight.insight}</p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    <strong>Recommendation:</strong> {insight.recommendation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Technical Integration</span>
                  </CardTitle>
                  <CardDescription>How Google Cloud AI and MongoDB work together</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-blue-600" />
                        Google Cloud AI Processing
                      </h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Gemini 1.5 Pro for content analysis</li>
                        <li>• Natural Language AI for sentiment detection</li>
                        <li>• Vertex AI for predictive modeling</li>
                        <li>• Real-time bias and misinformation scoring</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Database className="h-4 w-4 mr-2 text-green-600" />
                        MongoDB Atlas Features
                      </h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Vector search for semantic similarity</li>
                        <li>• Aggregation pipelines for complex analytics</li>
                        <li>• Atlas Search for full-text search</li>
                        <li>• Change streams for real-time updates</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg bg-purple-50">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-purple-600" />
                        Combined Power
                      </h4>
                      <ul className="text-sm space-y-1 text-purple-700">
                        <li>• AI-powered content analysis at scale</li>
                        <li>• Real-time misinformation detection</li>
                        <li>• Intelligent pattern recognition</li>
                        <li>• Predictive viral content modeling</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span>Hackathon Compliance</span>
                  </CardTitle>
                  <CardDescription>Meeting all challenge requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Public Dataset</p>
                        <p className="text-xs text-gray-600">MongoDB Samples</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <CheckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Google Cloud AI</p>
                        <p className="text-xs text-gray-600">Gemini 1.5 Pro</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <CheckIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">MongoDB Features</p>
                        <p className="text-xs text-gray-600">Vector Search</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <CheckIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Real-World Impact</p>
                        <p className="text-xs text-gray-600">Misinformation Detection</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <h4 className="font-bold text-center mb-2">🏆 Winning Combination</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          ✅ <strong>Innovation:</strong> First AI-powered misinformation tracker
                        </p>
                        <p>
                          ✅ <strong>Technical Excellence:</strong> Advanced MongoDB + Google AI
                        </p>
                        <p>
                          ✅ <strong>Real Impact:</strong> Combats misinformation at scale
                        </p>
                        <p>
                          ✅ <strong>Scalability:</strong> Cloud-native architecture
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Real-World Impact Tab */}
          <TabsContent value="impact">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-red-600" />
                    <span>Real-World Impact & Use Cases</span>
                  </CardTitle>
                  <CardDescription>How TruthGuard addresses critical misinformation challenges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 border rounded-lg bg-red-50">
                      <Target className="h-8 w-8 text-red-600 mb-3" />
                      <h3 className="font-bold mb-2">Election Security</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Detect and prevent election misinformation campaigns in real-time
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• Viral false claim detection</li>
                        <li>• Source coordination analysis</li>
                        <li>• Emotional manipulation alerts</li>
                      </ul>
                    </div>

                    <div className="p-6 border rounded-lg bg-blue-50">
                      <Globe className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-bold mb-2">Public Health</h3>
                      <p className="text-sm text-gray-600 mb-3">Combat health misinformation and vaccine hesitancy</p>
                      <ul className="text-xs space-y-1">
                        <li>• Medical claim verification</li>
                        <li>• Expert source validation</li>
                        <li>• Conspiracy theory detection</li>
                      </ul>
                    </div>

                    <div className="p-6 border rounded-lg bg-green-50">
                      <BarChart3 className="h-8 w-8 text-green-600 mb-3" />
                      <h3 className="font-bold mb-2">Financial Markets</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Prevent market manipulation through false information
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• Stock manipulation detection</li>
                        <li>• Pump and dump schemes</li>
                        <li>• Economic misinformation</li>
                      </ul>
                    </div>

                    <div className="p-6 border rounded-lg bg-purple-50">
                      <Brain className="h-8 w-8 text-purple-600 mb-3" />
                      <h3 className="font-bold mb-2">Social Media Platforms</h3>
                      <p className="text-sm text-gray-600 mb-3">Real-time content moderation and fact-checking</p>
                      <ul className="text-xs space-y-1">
                        <li>• Automated content flagging</li>
                        <li>• Viral prediction modeling</li>
                        <li>• User behavior analysis</li>
                      </ul>
                    </div>

                    <div className="p-6 border rounded-lg bg-orange-50">
                      <Shield className="h-8 w-8 text-orange-600 mb-3" />
                      <h3 className="font-bold mb-2">News Organizations</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Enhance editorial processes with AI-powered fact-checking
                      </p>
                      <ul className="text-xs space-y-1">
                        <li>• Source credibility scoring</li>
                        <li>• Bias detection in reporting</li>
                        <li>• Editorial quality assurance</li>
                      </ul>
                    </div>

                    <div className="p-6 border rounded-lg bg-yellow-50">
                      <Cpu className="h-8 w-8 text-yellow-600 mb-3" />
                      <h3 className="font-bold mb-2">Government Agencies</h3>
                      <p className="text-sm text-gray-600 mb-3">Monitor and respond to information warfare threats</p>
                      <ul className="text-xs space-y-1">
                        <li>• Foreign influence detection</li>
                        <li>• Coordinated campaign analysis</li>
                        <li>• National security monitoring</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Impact Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Projected Impact Metrics</CardTitle>
                  <CardDescription>Potential scale and reach of TruthGuard platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">1M+</p>
                      <p className="text-sm text-gray-600">Articles Analyzed Daily</p>
                      <Progress value={85} className="h-2 mt-2" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">95%</p>
                      <p className="text-sm text-gray-600">Accuracy Rate</p>
                      <Progress value={95} className="h-2 mt-2" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">50+</p>
                      <p className="text-sm text-gray-600">Languages Supported</p>
                      <Progress value={70} className="h-2 mt-2" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">24/7</p>
                      <p className="text-sm text-gray-600">Real-time Monitoring</p>
                      <Progress value={100} className="h-2 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
