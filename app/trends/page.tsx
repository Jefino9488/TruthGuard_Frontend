"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Filter, Download, Share2 } from "lucide-react"
import { BiasTimeline } from "@/components/bias-timeline"
import { TopicCluster } from "@/components/topic-cluster" // Keeping mock data for now
import { SourceComparisonMatrix } from "@/components/source-comparison-matrix" // Keeping mock data for now
import { NarrativeFlow } from "@/components/narrative-flow" // Keeping mock data for now
import { MediaBubbleChart } from "@/components/media-bubble-chart" // Keeping mock data for now
import { Skeleton } from "@/components/ui/skeleton"
import { SourceComparison } from "@/components/source-comparison"

export default function TrendsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [selectedTopic, setSelectedTopic] = useState("politics")
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null); // To store backend analytics

  useEffect(() => {
    const fetchTrendsData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard analytics from frontend API route, which proxies to backend
        const response = await fetch("/api/mongodb-analytics?type=overview"); // Fetch overview analytics
        const data = await response.json();
        if (data.success && data.data) {
          setAnalyticsData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch trends data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendsData();
  }, [dateRange, selectedTopic]); // Refetch when filters change

  // Data for BiasTimeline, adapted from backend's dashboard-analytics
  const biasTimelineData = useMemo(() => {
    if (!analyticsData?.biasDistribution) return [];
    // The backend provides buckets (0, 0.3, 0.6). We'll map them to a simple trend.
    // For a real timeline, backend would need to return time-series data.
    return analyticsData.biasDistribution.map((item: any) => {
      let dateLabel = `Bucket ${item._id.toFixed(1)}`; // Simplified for current backend output
      if (item._id === 0) dateLabel = "Low Bias";
      else if (item._id === 0.3) dateLabel = "Medium Bias";
      else if (item._id === 0.6) dateLabel = "High Bias";

      return {
        date: dateLabel,
        leftBias: item.count / 2, // Simplified representation
        rightBias: item.count / 2, // Simplified representation
        neutralContent: 0, // Not directly available
      };
    });
  }, [analyticsData]);

  // Data for SourceComparisonMatrix, adapted from backend's dashboard-analytics
  const sourceComparisonMatrixData = useMemo(() => {
    if (!analyticsData?.sourceComparison) return [];
    return analyticsData.sourceComparison.map((item: any) => ({
      source: item._id,
      averageBias: item.averageBias,
      averageMisinformationRisk: item.averageMisinformationRisk,
      averageCredibility: item.averageCredibility,
      articleCount: item.articleCount,
    }));
  }, [analyticsData]);

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Trend Analysis</h1>
                <p className="text-sm text-gray-600">Track bias patterns and misinformation trends over time</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Media Bias Trends</CardTitle>
                  <CardDescription>Analyze how bias and misinformation evolve over time</CardDescription>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* These topics should ideally come from backend unique topics */}
                      {analyticsData?.totalStats?.[0]?.uniqueTopics?.map((topic: string) => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      )) || (
                          <>
                            <SelectItem value="politics">Politics</SelectItem>
                            <SelectItem value="climate">Climate Change</SelectItem>
                            <SelectItem value="economy">Economy</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                          </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sources</label>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Filter className="h-4 w-4 mr-2" />
                    All Sources
                    <Badge className="ml-2" variant="secondary">
                      {analyticsData?.totalStats?.[0]?.uniqueSources?.length || 0}
                    </Badge>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Bias Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-blue-600">
                          {(analyticsData?.totalStats?.[0]?.avgBias * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Average overall bias</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Emerging Narrative</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {analyticsData?.emerging_patterns?.[0]?._id?.emotion || "N/A"}
                        </div>
                        <p className="text-sm text-gray-600">Most common emotion in recent articles</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">New</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Misinformation Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-red-600">
                          {(analyticsData?.totalStats?.[0]?.avgMisinfoRisk * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Average misinformation risk</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Alert</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
          )}

          {/* Main Content */}
          <Tabs defaultValue="timeline" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="timeline">Bias Timeline</TabsTrigger>
              <TabsTrigger value="topics">Topic Clusters</TabsTrigger>
              <TabsTrigger value="sources">Source Matrix</TabsTrigger>
              <TabsTrigger value="narratives">Narrative Flow</TabsTrigger>
              <TabsTrigger value="landscape">Media Landscape</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Bias Timeline</CardTitle>
                  <CardDescription>
                    Track how bias levels have changed over time across different media sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {loading ? <Skeleton className="h-96 w-full" /> : <BiasTimeline data={biasTimelineData} />}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics">
              <Card>
                <CardHeader>
                  <CardTitle>Topic Clusters</CardTitle>
                  <CardDescription>
                    Visualization of related topics and how they connect across the media landscape
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* TopicCluster relies on specific node/link data not readily available from /dashboard-analytics */}
                  {/* Backend would need an endpoint returning data structured for D3 force layout */}
                  <TopicCluster />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources">
              <Card>
                <CardHeader>
                  <CardTitle>Source Comparison Matrix</CardTitle>
                  <CardDescription>
                    Compare how different sources cover the same topics with varying perspectives
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* SourceComparisonMatrix relies on specific topic-level data for each source,
                    not directly available from /dashboard-analytics. */}
                  {/* Adapting SourceComparison from components/source-comparison.tsx */}
                  {loading ? <Skeleton className="h-[400px] w-full" /> : <SourceComparison data={sourceComparisonMatrixData} />}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="narratives">
              <Card>
                <CardHeader>
                  <CardTitle>Narrative Flow Analysis</CardTitle>
                  <CardDescription>
                    Track how narratives evolve and spread across different media sources over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* NarrativeFlow relies on specific node/link data for Sankey diagram,
                    not directly available from /dashboard-analytics. */}
                  <NarrativeFlow />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="landscape">
              <Card>
                <CardHeader>
                  <CardTitle>Media Landscape Visualization</CardTitle>
                  <CardDescription>
                    Interactive visualization of the media ecosystem showing bias and influence
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* MediaBubbleChart relies on specific media source data (bias, reliability, reach),
                    not directly available from /dashboard-analytics. */}
                  <MediaBubbleChart />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Insights and Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-generated analysis of current trends</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="space-y-4"><Skeleton className="h-24 w-full"/><Skeleton className="h-24 w-full"/><Skeleton className="h-24 w-full"/></div>
                ) : (
                    <div className="space-y-4">
                      {analyticsData?.ai_recommendations?.length > 0 ? (
                          analyticsData.ai_recommendations.slice(0, 3).map((insight: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <h3 className="font-medium mb-2 flex items-center">
                                  <Badge className="mr-2 bg-blue-100 text-blue-800">Insight</Badge>
                                  {insight.type?.replace(/_/g, " ") || "General Insight"}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {insight.message}
                                </p>
                              </div>
                          ))
                      ) : (
                          <div className="text-center text-gray-500 py-4">No AI insights available from backend.</div>
                      )}
                    </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictions</CardTitle>
                <CardDescription>AI-generated forecasts based on current trends</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="space-y-4"><Skeleton className="h-24 w-full"/><Skeleton className="h-24 w-full"/><Skeleton className="h-24 w-full"/></div>
                ) : (
                    <div className="space-y-4">
                      {analyticsData?.emerging_patterns?.length > 0 ? (
                          analyticsData.emerging_patterns.slice(0, 3).map((prediction: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <h3 className="font-medium mb-2 flex items-center">
                                  <Badge className="mr-2 bg-purple-100 text-purple-800">Prediction</Badge>
                                  Emerging {prediction._id.emotion} patterns
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Predicted average viral score of {(prediction.avg_viral * 100).toFixed(1)}% for content showing {prediction._id.emotion} emotions.
                                </p>
                                <div className="mt-2 flex items-center">
                                  <span className="text-xs text-gray-500 mr-2">Confidence:</span>
                                  <div className="h-2 w-24 bg-gray-200 rounded-full">
                                    <div className="h-2 w-[75%] bg-purple-600 rounded-full"></div> {/* Static confidence for now */}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-2">75%</span>
                                </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center text-gray-500 py-4">No AI predictions available from backend.</div>
                      )}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}