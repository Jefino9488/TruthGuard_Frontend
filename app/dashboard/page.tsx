"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from "lucide-react"
import { BiasChart } from "@/components/bias-chart"
import { SourceComparison } from "@/components/source-comparison" // Updated import
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
}

interface BackendStats {
  total_articles: number;
  bias_flagged: number;
  misinfo_flagged: number;
  high_credibility: number;
  avg_bias: number;
  avg_credibility: number;
}

// Data structure for BiasChart
interface BiasCategoryData {
  name: string; // e.g., "Left", "Center", "Right"
  articles: number; // Count of articles in this category
}

// Data structure for BiasHeatmap (Source Bias Averages)
interface SourceBiasData {
  source: string;
  averageBias: number; // Average bias score for this source
}

// Data structure for Source Comparison
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
      const articlesRes = await fetch("/api/mongodb");
      if (!articlesRes.ok) {
        const errorData = await articlesRes.json();
        throw new Error(errorData.message || `Failed to fetch articles: ${articlesRes.statusText}`);
      }
      const data = await articlesRes.json();
      const fetchedArticles: Article[] = data.articles || [];
      setArticles(fetchedArticles);

      // Derive dashboard key metrics from fetched articles
      const totalArticles = fetchedArticles.length;
      // Articles with bias significantly away from center (e.g., outside 0.4-0.6 range)
      const biasFlagged = fetchedArticles.filter((a: Article) => (a.bias_score !== undefined && (a.bias_score < 0.4 || a.bias_score > 0.6))).length;
      // Articles with misinformation risk above a threshold (e.g., > 0.6)
      const misinfoFlagged = fetchedArticles.filter((a: Article) => (a.misinformation_risk || 0) > 0.6).length;
      // Articles with high credibility (e.g., > 0.8)
      const highCredibility = fetchedArticles.filter((a: Article) => (a.credibility_score || 0) > 0.8).length;

      const totalBiasScore = fetchedArticles.reduce((sum: number, a: Article) => sum + (a.bias_score || 0), 0);
      const totalCredibilityScore = fetchedArticles.reduce((sum: number, a: Article) => sum + (a.credibility_score || 0), 0);
      const avgBias = totalArticles > 0 ? totalBiasScore / totalArticles : 0;
      const avgCredibility = totalArticles > 0 ? totalCredibilityScore / totalArticles : 0;

      setStats({
        total_articles: totalArticles,
        bias_flagged: biasFlagged,
        misinfo_flagged: misinfoFlagged,
        high_credibility: highCredibility,
        avg_bias: avgBias,
        avg_credibility: avgCredibility,
      });

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

  // Memoized data for BiasChart to prevent re-computation on every render
  const biasChartData: BiasCategoryData[] = useMemo(() => {
    const counts = {
      'Left': 0,
      'Left-Center': 0,
      'Center': 0,
      'Right-Center': 0,
      'Right': 0,
    };

    articles.forEach(article => {
      if (article.bias_score !== undefined) {
        if (article.bias_score >= 0 && article.bias_score <= 0.2) {
          counts['Left']++;
        } else if (article.bias_score > 0.2 && article.bias_score <= 0.4) {
          counts['Left-Center']++;
        } else if (article.bias_score > 0.4 && article.bias_score <= 0.6) {
          counts['Center']++;
        } else if (article.bias_score > 0.6 && article.bias_score <= 0.8) {
          counts['Right-Center']++;
        } else if (article.bias_score > 0.8 && article.bias_score <= 1.0) {
          counts['Right']++;
        }
      }
    });

    return Object.entries(counts).map(([name, articles]) => ({ name, articles }));
  }, [articles]);

  // Memoized data for BiasHeatmap (Source Bias Averages)
  const sourceBiasData: SourceBiasData[] = useMemo(() => {
    const sourceMap: { [key: string]: { totalBias: number; count: number } } = {};

    articles.forEach(article => {
      if (article.source && article.bias_score !== undefined) {
        if (!sourceMap[article.source]) {
          sourceMap[article.source] = { totalBias: 0, count: 0 };
        }
        sourceMap[article.source].totalBias += article.bias_score;
        sourceMap[article.source].count++;
      }
    });

    return Object.entries(sourceMap).map(([source, data]) => ({
      source,
      averageBias: data.count > 0 ? data.totalBias / data.count : 0,
    })).sort((a, b) => b.averageBias - a.averageBias); // Sort by bias for better visualization
  }, [articles]);

  // Memoized data for Source Comparison
  const sourceComparisonData: SourceComparisonData[] = useMemo(() => {
    const sourceMap: {
      [key: string]: {
        totalBias: number;
        totalMisinfo: number;
        totalCredibility: number;
        count: number;
      };
    } = {};

    articles.forEach(article => {
      if (article.source) {
        if (!sourceMap[article.source]) {
          sourceMap[article.source] = { totalBias: 0, totalMisinfo: 0, totalCredibility: 0, count: 0 };
        }
        if (article.bias_score !== undefined) sourceMap[article.source].totalBias += article.bias_score;
        if (article.misinformation_risk !== undefined) sourceMap[article.source].totalMisinfo += article.misinformation_risk;
        if (article.credibility_score !== undefined) sourceMap[article.source].totalCredibility += article.credibility_score;
        sourceMap[article.source].count++;
      }
    });

    return Object.entries(sourceMap).map(([source, data]) => ({
      source,
      averageBias: data.count > 0 ? data.totalBias / data.count : 0,
      averageMisinformationRisk: data.count > 0 ? data.totalMisinfo / data.count : 0,
      averageCredibility: data.count > 0 ? data.totalCredibility / data.count : 0,
      articleCount: data.count,
    })).sort((a, b) => b.articleCount - a.articleCount); // Sort by article count, or by bias/credibility as preferred
  }, [articles]);


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
                    <ThreatLevel />
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
                      <RecentArticles />
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
                                      Source: {article.source || "Unknown Source"} - {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'N/A'}
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
  )
}
