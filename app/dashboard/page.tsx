"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from "lucide-react"
import { BiasChart } from "@/components/bias-chart"
import { SourceComparison } from "@/components/source-comparison"
import { ThreatLevel } from "@/components/threat-level"
import { RecentArticles } from "@/components/recent-articles"
import { BiasHeatmap } from "@/components/bias-heatmap"
import { Skeleton } from "@/components/ui/skeleton"

interface Article {
  _id: string;
  title: string;
  source: string;
  published_at?: string;
  bias_score?: number; // Assuming 0.0 (Left) to 1.0 (Right), 0.5 (Center)
  misinformation_risk?: number; // e.g., 0.0 (Low) to 1.0 (High)
  credibility_score?: number; // e.g., 0.0 (Low) to 1.0 (High)
  analyzed_at?: string; // Add analyzed_at for sorting
  ai_analysis?: any; // To access nested analysis data if needed
}

interface BackendStats {
  total_articles: number;
  bias_flagged: number;
  misinfo_flagged: number;
  high_credibility: number;
  avg_bias: number;
  avg_credibility: number;
  // Raw data from backend /dashboard-analytics endpoint
  totalStats?: any;
  biasDistribution?: any[];
  sourceComparison?: any[];
  emerging_patterns?: any[];
  threat_assessment?: any[];
  ai_recommendations?: any[];
  system_health?: any;
  alert_priorities?: any[];
}

interface BiasCategoryData {
  name: string; // e.g., "Left", "Center", "Right"
  articles: number; // Count of articles in this category
}

interface SourceBiasData {
  source: string;
  averageBias: number; // Average bias score for this source
}

interface SourceComparisonData {
  source: string;
  averageBias: number;
  averageMisinformationRisk: number;
  averageCredibility: number;
  articleCount: number;
}


export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<BackendStats | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch articles from the frontend API which now routes to backend
      const articlesRes = await fetch("/api/mongodb"); // This now fetches from backend /articles
      if (!articlesRes.ok) {
        const errorData = await articlesRes.json();
        throw new Error(errorData.message || `Failed to fetch articles: ${articlesRes.statusText}`);
      }
      const articlesData = await articlesRes.json();
      const fetchedArticles: Article[] = articlesData.articles || [];
      setArticles(fetchedArticles);

      // Fetch aggregated stats from the frontend API which routes to backend's dashboard-analytics
      const statsRes = await fetch("/api/mongodb-analytics"); // This now fetches from backend /dashboard-analytics
      if (!statsRes.ok) {
        const errorData = await statsRes.json();
        throw new Error(errorData.message || `Failed to fetch analytics: ${statsRes.statusText}`);
      }
      const statsData = await statsRes.json();
      if (statsData.success && statsData.data) {
        const backendDashboardData = statsData.data;

        // Map backend's dashboard data to frontend's expected stats structure
        const totalStats = backendDashboardData.totalStats?.[0] || {};
        const biasFlaggedCount = backendDashboardData.biasDistribution?.filter((b: any) => b._id > 0.6)?.[0]?.count || 0;
        const misinfoFlaggedCount = backendDashboardData.overall_metrics?.high_risk_count || 0; // Assuming this from backend
        const highCredibilityCount = backendDashboardData.biasDistribution?.filter((b: any) => b._id === 0.0)?.[0]?.count || 0; // Simplified for demo, count low bias as high credibility

        setStats({
          total_articles: totalStats.totalArticles || 0,
          bias_flagged: biasFlaggedCount,
          misinfo_flagged: misinfoFlaggedCount,
          high_credibility: highCredibilityCount,
          avg_bias: totalStats.avgBias || 0,
          avg_credibility: totalStats.avgCredibility || 0,
          // Pass raw backend data for charts
          totalStats: totalStats,
          biasDistribution: backendDashboardData.biasDistribution,
          sourceComparison: backendDashboardData.sourceComparison,
          emerging_patterns: backendDashboardData.emerging_patterns,
          threat_assessment: backendDashboardData.threat_assessment,
          ai_recommendations: backendDashboardData.ai_recommendations,
          system_health: backendDashboardData.system_health,
          alert_priorities: backendDashboardData.alert_priorities,
        });
      }

    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  // Memoized data for BiasChart adapted from backend's biasDistribution
  const biasChartData: BiasCategoryData[] = useMemo(() => {
    if (!stats?.biasDistribution) return [];
    return stats.biasDistribution.map((item: any) => {
      let name = "";
      if (item._id === 0) name = "Low (0-0.3)";
      else if (item._id === 0.3) name = "Medium (0.3-0.6)";
      else if (item._id === 0.6) name = "High (0.6-1.0)";
      else name = "Unknown";
      return {
        name,
        articles: item.count,
      };
    }).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically or by specific order
  }, [stats?.biasDistribution]);

  // Memoized data for BiasHeatmap (Source Bias Averages)
  const sourceBiasData: SourceBiasData[] = useMemo(() => {
    if (!stats?.sourceComparison) return [];
    return stats.sourceComparison.map((item: any) => ({
      source: item._id,
      averageBias: item.averageBias,
    })).sort((a, b) => b.averageBias - a.averageBias); // Sort by bias for better visualization
  }, [stats?.sourceComparison]);

  // Memoized data for Source Comparison
  const sourceComparisonData: SourceComparisonData[] = useMemo(() => {
    if (!stats?.sourceComparison) return [];
    return stats.sourceComparison.map((item: any) => ({
      source: item._id,
      averageBias: item.averageBias,
      averageMisinformationRisk: item.averageMisinformationRisk,
      averageCredibility: item.averageCredibility,
      articleCount: item.articleCount,
    })).sort((a, b) => b.articleCount - a.articleCount); // Sort by article count, or by bias/credibility as preferred
  }, [stats?.sourceComparison]);


  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">TruthGuard Dashboard</h1>
                  <p className="text-sm text-gray-600">Real-time bias and misinformation detection</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  System Online
                </Badge>
                <Button size="sm" variant="outline" onClick={refreshData} disabled={loading}>
                  {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Articles Processed</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-20" /> : (stats?.total_articles || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+N% from yesterday</p> {/* Placeholder for dynamic percentage */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bias Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-20" /> : (stats?.bias_flagged || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">-N% from yesterday</p> {/* Placeholder for dynamic percentage */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Misinformation Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-20" /> : (stats?.misinfo_flagged || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+N% from yesterday</p> {/* Placeholder for dynamic percentage */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credibility Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-20" /> : `${(stats?.avg_credibility * 100 || 0).toFixed(1)}%`}</div>
                <p className="text-xs text-muted-foreground">+N% from yesterday</p> {/* Placeholder for dynamic percentage */}
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bias-analysis">Bias Analysis</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="real-time">Real-time</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bias Distribution</CardTitle>
                    <CardDescription>Current bias patterns across all sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : (
                        <BiasChart data={biasChartData} />
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Threat Assessment</CardTitle>
                    <CardDescription>Real-time misinformation risk levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* ThreatLevel component likely needs a single threat score from backend */}
                    <ThreatLevel currentThreat={Math.round((stats?.avg_misinfo || 0) * 100)} />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Analysis</CardTitle>
                  <CardDescription>Latest articles processed by the AI system</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                  ) : (
                      <RecentArticles articles={articles} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bias-analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bias Heatmap (Average Bias by Source)</CardTitle>
                  <CardDescription>Visual representation of average bias per source</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                      <Skeleton className="h-[400px] w-full" />
                  ) : (
                      <BiasHeatmap data={sourceBiasData} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Source Comparison</CardTitle>
                  <CardDescription>Bias analysis across different news sources</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                      <Skeleton className="h-[300px] w-full" />
                  ) : (
                      <SourceComparison data={sourceComparisonData} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="real-time" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Feed</CardTitle>
                    <CardDescription>Real-time article processing updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                      ) : articles.length > 0 ? (
                          articles.slice(0, 7).map((article, i) => ( // Displaying recent 7 articles
                              <div key={article._id || i} className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
                                <div className="flex items-center space-x-3">
                                  {/* Simulate processing status - in a real app, this would come from backend */}
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <div>
                                    <p className="font-medium text-sm text-gray-800 line-clamp-1">
                                      {article.title || "Untitled Article"}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Source: {article.source || "Unknown Source"} - {article.analyzed_at ? new Date(article.analyzed_at).toLocaleDateString() : article.published_at ? new Date(article.published_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-xs">Processed</Badge>
                              </div>
                          ))
                      ) : (
                          <div className="text-center text-gray-500 py-4">No recent articles to display.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Overall health and operational status of TruthGuard components</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* These status indicators are static for demonstration.
                        In a real application, these would be fetched from a dedicated
                        backend health-check endpoint or monitoring service. */}
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">Gemini AI Model</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                        {/* Example of dynamic status: {aiModelStatus === 'healthy' ? <Badge>Healthy</Badge> : <Badge variant="destructive">Degraded</Badge>} */}
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">MongoDB Atlas</span>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        {/* Example of dynamic status: {mongoStatus === 'connected' ? <Badge>Connected</Badge> : <Badge variant="destructive">Disconnected</Badge>} */}
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">Vector Search Engine</span>
                        <Badge className="bg-green-100 text-green-800">Operational</Badge>
                        {/* Example of dynamic status: {vectorSearchStatus === 'operational' ? <Badge>Operational</Badge> : <Badge variant="destructive">Offline</Badge>} */}
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">Scraping Service</span>
                        <Badge className="bg-green-100 text-green-800">Running</Badge>
                        {/* Example of dynamic status: {scraperStatus === 'running' ? <Badge>Running</Badge> : <Badge variant="destructive">Stopped</Badge>} */}
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">Analysis Pipeline</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        {/* Example of dynamic status: {pipelineStatus === 'active' ? <Badge>Active</Badge> : <Badge variant="destructive">Paused</Badge>} */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}