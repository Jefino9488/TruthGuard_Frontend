// app/search/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink, Loader2 } from "lucide-react"

interface Article {
  _id: string;
  title: string;
  source: string;
  bias_score: number;
  misinformation_risk: number;
  topic?: string;
  published_at?: string;
  content?: string;
  url?: string;
  vectorSearchScore?: number;
  // Add other fields that might be returned by vector search
  ai_analysis?: any; // To get nested analysis data
  credibility_score?: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("all") // Frontend filter, backend currently doesn't support this on vector search
  const [selectedSource, setSelectedSource] = useState("all") // Frontend filter, backend currently doesn't support this on vector search
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)

  const handleSearch = async () => {
    setLoading(true);
    setFilteredArticles([]);
    setTotalResults(0);

    try {
      // Change: Call the frontend API route for vector search.
      // This will now make a POST request to your backend's /vector-search endpoint.
      const response = await fetch(`/api/mongodb-vector?q=${encodeURIComponent(searchQuery)}`, {
        method: "GET", // This is the method of the frontend route. The frontend route will make a POST to backend.
      });
      const data = await response.json();

      if (data.success) {
        // The backend's /vector-search returns data.data (which is the articles array)
        let articles = data.data || [];

        // Note: The backend's /vector-search currently does NOT support
        // filtering by topic or source. These filters would need to be
        // applied client-side here, or the backend endpoint needs enhancement.
        // For now, applying client-side for demonstration purposes,
        // but be aware this is after the vector search is performed on ALL articles.
        if (selectedTopic !== "all") {
          articles = articles.filter((article: Article) =>
              article.ai_analysis?.technical_analysis?.key_topics?.includes(selectedTopic) // Assuming topic is in ai_analysis.technical_analysis.key_topics
          );
        }
        if (selectedSource !== "all") {
          articles = articles.filter((article: Article) => article.source === selectedSource);
        }


        setFilteredArticles(articles);
        setTotalResults(articles.length); // Total results after client-side filtering
      } else {
        console.error("Search failed:", data.error);
        setFilteredArticles([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setFilteredArticles([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }

  const getBiasLabel = (score: number) => {
    if (score < 0.4) return { label: "Low Bias", color: "bg-green-100 text-green-800" }
    if (score > 0.6) return { label: "High Bias", color: "bg-red-100 text-red-800" }
    return { label: "Moderate Bias", color: "bg-yellow-100 text-yellow-800" }
  }

  const getRiskLabel = (score: number) => {
    if (score < 0.3) return { label: "Low Risk", color: "bg-green-100 text-green-800" }
    if (score < 0.6) return { label: "Medium Risk", color: "bg-yellow-100 text-yellow-800" }
    return { label: "High Risk", color: "bg-red-100 text-red-800" }
  }

  const formatArticleSummary = (content: string | undefined) => {
    if (!content) return "No summary available.";
    return content.substring(0, 200) + (content.length > 200 ? "..." : "");
  };

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Search className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Article Search</h1>
                <p className="text-sm text-gray-600">Search and analyze articles with AI-powered bias detection</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Search Interface */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Semantic Search</CardTitle>
              <CardDescription>
                Search through millions of articles using MongoDB vector search and AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                        placeholder="Search articles, topics, or bias patterns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !loading && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching
                        </>
                    ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                    )}
                  </Button>
                </div>
                <div className="flex space-x-4">
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="Politics">Politics</SelectItem>
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="Reuters">Reuters</SelectItem>
                      <SelectItem value="Wall Street Journal">Wall Street Journal</SelectItem>
                      <SelectItem value="Fox News">Fox News</SelectItem>
                      <SelectItem value="CNN">CNN</SelectItem>
                      <SelectItem value="Bloomberg">Bloomberg</SelectItem>
                      <SelectItem value="NPR">NPR</SelectItem>
                      <SelectItem value="BBC">BBC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <Tabs defaultValue="articles" className="space-y-6">
            <TabsList>
              <TabsTrigger value="articles">Articles ({totalResults})</TabsTrigger>
              <TabsTrigger value="patterns" disabled>Bias Patterns</TabsTrigger>
              <TabsTrigger value="similar" disabled>Similar Content</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="space-y-4">
              {filteredArticles.length === 0 && !loading && searchQuery.length > 0 ? (
                  <div className="text-center py-8 text-gray-500">No articles found matching your criteria.</div>
              ) : filteredArticles.map((article) => {
                const biasInfo = getBiasLabel(article.bias_score || 0.5)
                const riskInfo = getRiskLabel(article.misinformation_risk || 0.1)

                return (
                    <Card key={article._id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{article.source}</span>
                              <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : 'N/A'}</span>
                              {/* Use key_topics from ai_analysis if available, fallback to category */}
                              <Badge variant="outline">{article.ai_analysis?.technical_analysis?.key_topics?.[0] || article.topic || "General"}</Badge>
                              {article.vectorSearchScore !== undefined && (
                                  <Badge variant="secondary">Similarity: {(article.vectorSearchScore * 100).toFixed(1)}%</Badge>
                              )}
                            </div>
                          </div>
                          {article.url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{formatArticleSummary(article.content)}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Bias Score:</span>
                            <Badge className={biasInfo.color}>{biasInfo.label}</Badge>
                            <span className="text-sm text-gray-500">({((article.bias_score || 0.5) * 100).toFixed(1)}%)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Risk Level:</span>
                            <Badge className={riskInfo.color}>{riskInfo.label}</Badge>
                            <span className="text-sm text-gray-500">
                          ({((article.misinformation_risk || 0.1) * 100).toFixed(1)}%)
                        </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detected Bias Patterns</CardTitle>
                  <CardDescription>Common bias patterns found in search results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Emotional Language</h4>
                        <p className="text-sm text-gray-600">Use of charged emotional terms</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Found in 3 articles</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Source Selection Bias</h4>
                        <p className="text-sm text-gray-600">Limited or one-sided source selection</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Found in 2 articles</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Statistical Manipulation</h4>
                        <p className="text-sm text-gray-600">Misleading use of statistics</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Found in 1 article</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="similar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Similar Content Analysis</CardTitle>
                  <CardDescription>Articles with similar topics using vector similarity search</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredArticles.slice(0, 3).map((article) => (
                        <div key={article._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{article.title}</h4>
                            <p className="text-sm text-gray-600">
                              {article.source} • Similarity: {((article.vectorSearchScore || 0) * 100).toFixed(1)}%
                            </p>
                          </div>
                          {article.url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                  View
                                </a>
                              </Button>
                          )}
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}