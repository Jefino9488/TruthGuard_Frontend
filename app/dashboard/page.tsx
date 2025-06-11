"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Loader2, BrainCircuit, Plus, LinkIcon, FileText, Globe } from "lucide-react"
import { BiasChart } from "@/components/bias-chart"
import { SourceComparison } from "@/components/source-comparison"
import { ThreatLevel } from "@/components/threat-level"
import { RecentArticles } from "@/components/recent-articles"
import { BiasHeatmap } from "@/components/bias-heatmap"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast" // Import useToast
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"

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
  category?: string; // Add category field for topics
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5; // Display 5 articles per page
  const [totalArticleCount, setTotalArticleCount] = useState(0);

  // Manual analysis states
  const [showManualAnalyzeDialog, setShowManualAnalyzeDialog] = useState(false);
  const [manualAnalyzeContent, setManualAnalyzeContent] = useState("");
  const [manualAnalyzeUrl, setManualAnalyzeUrl] = useState("");
  const [manualAnalyzeTab, setManualAnalyzeTab] = useState("text"); // 'text' or 'url'
  const [isAnalyzingManual, setIsAnalyzingManual] = useState(false);

  // Separate states for scraping and analysis
  const [isScraping, setIsScraping] = useState(false);
  const [isAnalyzingBackend, setIsAnalyzingBackend] = useState(false); // New state for backend analysis trigger

  const { toast } = useToast(); // Initialize toast

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch articles with pagination from the frontend API which now routes to backend
      const articlesRes = await fetch(`/api/mongodb?page=${page}&limit=${limit}`);
      if (!articlesRes.ok) {
        const errorData = await articlesRes.json();
        throw new Error(errorData.message || `Failed to fetch articles: ${articlesRes.statusText}`);
      }
      const articlesData = await articlesRes.json();
      const fetchedArticles: Article[] = articlesData.articles || [];
      setArticles(fetchedArticles);
      setTotalArticleCount(articlesData.total_results || 0); // Update total articles for pagination

      // Fetch aggregated stats from the frontend API which routes to backend's dashboard-analytics
      const statsRes = await fetch("/api/mongodb-analytics");
      if (!statsRes.ok) {
        const errorData = await statsRes.json();
        throw new Error(errorData.message || `Failed to fetch analytics: ${statsRes.statusText}`);
      }
      const statsData = await statsRes.json();
      if (statsData.success && statsData.data) {
        const backendDashboardData = statsData.data;

        const totalStats = backendDashboardData.totalStats?.[0] || {};
        const biasFlaggedCount = backendDashboardData.biasDistribution?.filter((b: any) => b._id >= 0.6).reduce((sum: number, b: any) => sum + b.count, 0) || 0;
        const misinfoFlaggedCount = backendDashboardData.misinformation_flagged_count || (backendDashboardData.threat_assessment?.reduce((sum: number, threat: any) => sum + (threat.avg_threat_level >= 0.6 ? threat.threat_count : 0), 0) || 0);
        const highCredibilityCount = backendDashboardData.high_credibility_count || (totalStats.avgCredibility && totalStats.totalArticles ? Math.round(totalStats.avgCredibility * totalStats.totalArticles) : 0);

        setStats({
          total_articles: totalStats.totalArticles || 0,
          bias_flagged: biasFlaggedCount,
          misinfo_flagged: misinfoFlaggedCount,
          high_credibility: highCredibilityCount,
          avg_bias: totalStats.avgBias || 0,
          avg_credibility: totalStats.avgCredibility || 0,
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
    fetchData(currentPage, articlesPerPage);
  }, [currentPage]); // Refetch data when currentPage changes

  const refreshData = () => {
    setCurrentPage(1); // Reset to first page on refresh
    fetchData(1, articlesPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // New: Handle only news scraping
  const handleScrapeNews = async () => {
    setIsScraping(true);
    try {
      const response = await fetch("/api/news-scraper", { // Calls frontend /api/news-scraper (GET)
        method: "GET",
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Scraping Initiated",
          description: result.message,
        });
        // Optionally refresh data after a short delay to see initial scraping effects
        setTimeout(() => fetchData(currentPage, articlesPerPage), 3000); // Give scraper some time
      } else {
        toast({
          title: "Scraping Failed",
          description: result.details || "Unknown error during scraping initiation.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error triggering news scraping:", error);
      toast({
        title: "Error",
        description: `Failed to trigger news scraping: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  };

  // New: Handle only analysis of scraped articles
  const handleAnalyzeNews = async () => {
    setIsAnalyzingBackend(true);
    try {
      // Changed: Call frontend API route for analysis
      const response = await fetch("/api/analyze", { // Calls frontend /api/analyze (POST)
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Empty body as backend /analyze doesn't need input
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Analysis Initiated",
          description: result.message || "AI analysis of scraped articles has been started on the backend.",
        });
        // Refresh data after a delay, as analysis is a background task
        setTimeout(() => fetchData(currentPage, articlesPerPage), 5000);
      } else {
        toast({
          title: "Analysis Failed",
          description: result.details || "Unknown error during analysis initiation.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error triggering analysis:", error);
      toast({
        title: "Error",
        description: `Failed to trigger analysis: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingBackend(false);
    }
  };


  const handleManualAnalyze = async () => {
    setIsAnalyzingManual(true);
    let payload: { headline?: string; content?: string; url?: string } = {};

    if (manualAnalyzeTab === "text") {
      if (!manualAnalyzeContent.trim()) {
        toast({
          title: "Input Required",
          description: "Please enter content to analyze.",
          variant: "destructive",
        });
        setIsAnalyzingManual(false);
        return;
      }
      payload = {
        headline: manualAnalyzeContent.substring(0, 100),
        content: manualAnalyzeContent,
      };
    } else { // manualAnalyzeTab === 'url'
      if (!manualAnalyzeUrl.trim()) {
        toast({
          title: "Input Required",
          description: "Please enter a URL to analyze.",
          variant: "destructive",
        });
        setIsAnalyzingManual(false);
        return;
      }
      payload = { url: manualAnalyzeUrl };
    }

    try {
      // Calls frontend /api/mongodb (POST), which then calls backend /analyze-manual
      const response = await fetch("/api/mongodb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success && result.analysis_result) {
        toast({
          title: "Analysis Complete",
          description: `Content processed and stored by backend. Bias: ${(result.analysis_result.bias_analysis?.overall_score * 100).toFixed(1)}%, Risk: ${(result.analysis_result.misinformation_analysis?.risk_score * 100).toFixed(1)}%.`,
        });
        setShowManualAnalyzeDialog(false);
        setManualAnalyzeContent("");
        setManualAnalyzeUrl("");
        setManualAnalyzeTab("text");
        // Refresh data to show new article if it was added
        fetchData(currentPage, articlesPerPage);
      } else {
        toast({
          title: "Analysis Failed",
          description: result.error || "Unknown error during analysis.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error during manual analysis:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingManual(false);
    }
  };

  // Memoized data for BiasChart adapted from backend's biasDistribution
  const biasChartData: BiasCategoryData[] = useMemo(() => {
    if (!stats?.biasDistribution) return [];
    const mappedData = stats.biasDistribution.map((item: any) => {
      let name = "";
      if (item._id >= 0.8) name = "Very High (0.8-1.0)";
      else if (item._id >= 0.6) name = "High (0.6-0.8)";
      else if (item._id >= 0.4) name = "Moderate (0.4-0.6)";
      else if (item._id >= 0.2) name = "Low (0.2-0.4)";
      else name = "Very Low (0-0.2)";

      return {
        name,
        articles: item.count,
      };
    });
    return mappedData.sort((a, b) => {
      const order = ["Very Low (0-0.2)", "Low (0.2-0.4)", "Moderate (0.4-0.6)", "High (0.6-0.8)", "Very High (0.8-1.0)"];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
  }, [stats?.biasDistribution]);

  // Memoized data for BiasHeatmap (Source Bias Averages)
  const sourceBiasData: SourceBiasData[] = useMemo(() => {
    if (!stats?.sourceComparison) return [];
    return stats.sourceComparison.map((item: any) => ({
      source: item._id,
      averageBias: item.averageBias,
    })).sort((a, b) => b.averageBias - a.averageBias);
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
    })).sort((a, b) => b.articleCount - a.articleCount);
  }, [stats?.sourceComparison]);

  const totalPages = Math.ceil(totalArticleCount / articlesPerPage);

  // Function to generate pagination items (e.g., 1, 2, ..., 10, 11, 12, ..., 20)
  const getPaginationItems = (currentPage: number, totalPages: number) => {
    const pages = [];
    const maxVisiblePages = 5; // How many page numbers to show directly (excluding prev/next/ellipses)

    if (totalPages <= maxVisiblePages + 2) { // If total pages are few, show all of them + 2 for prev/next
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const paginationItems = getPaginationItems(currentPage, totalPages);

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
                {/* New Manual Analysis Button */}
                <Button size="sm" variant="outline" onClick={() => setShowManualAnalyzeDialog(true)} disabled={loading || isAnalyzingManual}>
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Analyze Content
                </Button>
                {/* Separated Scrape and Analyze Buttons */}
                <Button size="sm" variant="outline" onClick={handleScrapeNews} disabled={loading || isScraping}>
                  {isScraping ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Scrape News
                </Button>
                <Button size="sm" variant="outline" onClick={handleAnalyzeNews} disabled={loading || isAnalyzingBackend || isScraping}>
                  {isAnalyzingBackend ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                      <BrainCircuit className="h-4 w-4 mr-2" />
                  )}
                  Analyze Scraped
                </Button>
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
                <p className="text-xs text-muted-foreground">+N% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bias Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-20" /> : (stats?.bias_flagged || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">-N% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Misinformation Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-20" /> : (stats?.misinfo_flagged || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+N% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credibility Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-20" /> : `${(stats?.avg_credibility * 100 || 0).toFixed(1)}%`}</div>
                <p className="text-xs text-muted-foreground">+N% from yesterday</p>
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
                    <ThreatLevel currentThreat={Math.round((stats?.totalStats?.[0]?.avgMisinfoRisk || 0) * 100)} />
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
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                      <div className="mt-4 flex justify-center"> {/* Centered pagination */}
                        <Pagination>
                          <PaginationContent className="flex-wrap">
                            <PaginationItem>
                              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }} />
                            </PaginationItem>
                            {paginationItems.map((item, index) => (
                                <PaginationItem key={index}>
                                  {item === '...' ? (
                                      <PaginationEllipsis />
                                  ) : (
                                      <PaginationLink href="#" isActive={currentPage === item} onClick={(e) => { e.preventDefault(); setCurrentPage(item as number); }}>
                                        {item}
                                      </PaginationLink>
                                  )}
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }} />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
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
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">Gemini AI Model</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">MongoDB Atlas</span>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">Vector Search Engine</span>
                        <Badge className="bg-green-100 text-green-800">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">Scraping Service</span>
                        <Badge className="bg-green-100 text-green-800">Running</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="font-medium">Analysis Pipeline</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Manual Analyze Dialog */}
        <Dialog open={showManualAnalyzeDialog} onOpenChange={setShowManualAnalyzeDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Analyze Content Manually</DialogTitle>
              <DialogDescription>
                Paste article text or provide a URL for immediate AI analysis.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Tabs value={manualAnalyzeTab} onValueChange={setManualAnalyzeTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                  <Textarea
                      placeholder="Paste article text or enter content to analyze..."
                      className="min-h-[150px]"
                      value={manualAnalyzeContent}
                      onChange={(e) => setManualAnalyzeContent(e.target.value)}
                      disabled={isAnalyzingManual}
                  />
                </TabsContent>
                <TabsContent value="url" className="mt-4">
                  <Input
                      placeholder="https://example.com/article"
                      value={manualAnalyzeUrl}
                      onChange={(e) => setManualAnalyzeUrl(e.target.value)}
                      disabled={isAnalyzingManual}
                  />
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Content will be fetched and analyzed.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => {
                    setShowManualAnalyzeDialog(false);
                    setManualAnalyzeContent("");
                    setManualAnalyzeUrl("");
                    setManualAnalyzeTab("text");
                  }}
                  disabled={isAnalyzingManual}
              >
                Cancel
              </Button>
              <Button onClick={handleManualAnalyze} disabled={isAnalyzingManual || (manualAnalyzeTab === "text" && !manualAnalyzeContent.trim()) || (manualAnalyzeTab === "url" && !manualAnalyzeUrl.trim())}>
                {isAnalyzingManual ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                ) : (
                    "Analyze"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
