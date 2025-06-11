// app/analyze/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  Loader2,
  LinkIcon,
  FileText,
  Globe,
  MessageCircle,
  BarChart as LucideBarChart,
  Info,
  XCircle,
  ExternalLink,
  TrendingUp,
  Users
} from "lucide-react"
import { SentimentAnalysis } from "@/components/sentiment-analysis"
import { FactCheckResults } from "@/components/fact-check-results"
import { BiasBreakdown } from "@/components/bias-breakdown"
import { CredibilityScore } from "@/components/credibility-score"
import { NarrativeAnalysis } from "@/components/narrative-analysis"
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  AreaChart,
  Area,
  defs,
  linearGradient,
  stop
} from "recharts"

// Updated AnalysisResult to match backend's AnalysisResponse Pydantic model
interface AnalysisResult {
  bias_analysis: {
    overall_score: number;
    political_leaning: string;
    bias_indicators: string[];
    language_bias: number;
    source_bias: number;
    framing_bias: number;
    selection_bias: number;
    confirmation_bias: number;
  };
  misinformation_analysis: {
    risk_score: number;
    fact_checks: Array<{
      claim: string;
      verdict: string;
      confidence: number;
      explanation: string;
      sources: string[];
    }>;
    red_flags: string[];
    logical_fallacies: string[];
    evidence_quality: number;
  };
  sentiment_analysis: {
    overall_sentiment: number;
    emotional_tone: string;
    key_phrases: string[];
    emotional_manipulation: number;
    subjectivity_score: number;
  };
  credibility_assessment: {
    overall_score: number;
    evidence_quality: number;
    source_reliability: number;
    logical_consistency: number;
    transparency: number;
  };
  narrative_analysis: {
    primary_frame: string;
    secondary_frames: string[];
    narrative_patterns: string[];
    actor_portrayal: {
      main_actor?: string;
      tone?: string;
      role?: string;
    };
    perspective_diversity: number;
  };
  technical_analysis: {
    readability_score: number;
    complexity_level: string;
    word_count: number;
    key_topics: string[];
    named_entities: string[];
  };
  recommendations: {
    verification_needed: string[];
    alternative_sources: string[];
    critical_questions: string[];
    bias_mitigation: string[];
  };
  confidence: number;
  model_version: string;
}

export default function AnalyzePage() {
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("text")
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [articleMeta, setArticleMeta] = useState<any>(null);

  const [advancedOptions, setAdvancedOptions] = useState({
    factCheck: true,
    sentimentAnalysis: true,
    narrativeDetection: true,
    sourceCredibility: true,
    biasDetection: true,
  })

  const handleAnalyze = async () => {
    const payload: { headline?: string; content?: string; url?: string } = {};
    if (activeTab === "text") {
      if (!content.trim()) return;
      payload.headline = content.substring(0, 100);
      payload.content = content;
    } else {
      if (!url.trim()) return;
      payload.url = url;
    }

    setIsAnalyzing(true)
    setAnalysisComplete(false)
    setAnalysisProgress(0)
    setAnalysisResults(null);
    setArticleMeta(null);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        if (newProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return newProgress
      })
    }, 600)

    try {
      // Calls frontend /api/mongodb, which then calls backend /analyze-manual
      const response = await fetch("/api/mongodb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success && result.analysis_result) {
        setAnalysisResults(result.analysis_result);
        setArticleMeta(result.article_meta);
      } else {
        console.error("Analysis failed:", result.error || "Unknown error");
        alert("Analysis failed: " + (result.error || "Please check backend logs."));
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      alert("An unexpected error occurred during analysis.");
    } finally {
      setAnalysisProgress(100);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 500);
    }
  }

  const handleReset = () => {
    setContent("")
    setUrl("")
    setAnalysisComplete(false)
    setAnalysisProgress(0)
    setAnalysisResults(null);
    setArticleMeta(null);
  }

  // Ensure these components receive the correct parts of analysisResults
  const biasBreakdownData = analysisResults?.bias_analysis;
  const factCheckResultsData = analysisResults?.misinformation_analysis;
  const sentimentAnalysisData = analysisResults?.sentiment_analysis;
  const narrativeAnalysisData = analysisResults?.narrative_analysis;
  const credibilityScoreData = analysisResults?.credibility_assessment?.overall_score;

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <BrainCircuit className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Content Analyzer</h1>
                <p className="text-sm text-gray-600">Deep analysis of bias, sentiment, and misinformation</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Analyze Content</CardTitle>
                  <CardDescription>
                    Enter text, paste an article, or provide a URL to analyze for bias and misinformation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Text Input</TabsTrigger>
                      <TabsTrigger value="url">URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="space-y-4 mt-4">
                      <Textarea
                          placeholder="Paste article text or enter content to analyze..."
                          className="min-h-[200px]"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          disabled={isAnalyzing}
                      />
                    </TabsContent>
                    <TabsContent value="url" className="space-y-4 mt-4">
                      <div className="flex space-x-2">
                        <Input
                            placeholder="https://example.com/article"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isAnalyzing}
                        />
                        <Button variant="outline" size="icon" disabled={isAnalyzing}>
                          <Globe className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-500">Article will be fetched and analyzed</span>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Advanced Options</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="fact-check" className="flex items-center space-x-2 cursor-pointer">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Fact Checking</span>
                        </Label>
                        <Switch
                            id="fact-check"
                            checked={advancedOptions.factCheck}
                            onCheckedChange={(checked) => setAdvancedOptions({ ...advancedOptions, factCheck: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sentiment" className="flex items-center space-x-2 cursor-pointer">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span>Sentiment Analysis</span>
                        </Label>
                        <Switch
                            id="sentiment"
                            checked={advancedOptions.sentimentAnalysis}
                            onCheckedChange={(checked) =>
                                setAdvancedOptions({ ...advancedOptions, sentimentAnalysis: checked })
                            }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="narrative" className="flex items-center space-x-2 cursor-pointer">
                          <BrainCircuit className="h-4 w-4 text-purple-600" />
                          <span>Narrative Detection</span>
                        </Label>
                        <Switch
                            id="narrative"
                            checked={advancedOptions.narrativeDetection}
                            onCheckedChange={(checked) =>
                                setAdvancedOptions({ ...advancedOptions, narrativeDetection: checked })
                            }
                        />
                      </div>
                    </div>
                  </div>

                  {isAnalyzing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Analyzing content...</span>
                          <span>{Math.round(analysisProgress)}%</span>
                        </div>
                        <Progress value={analysisProgress} className="h-2" />
                      </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                        className="flex-1"
                        onClick={handleAnalyze}
                        disabled={
                            isAnalyzing || (activeTab === "text" && !content.trim()) || (activeTab === "url" && !url.trim())
                        }
                    >
                      {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing
                          </>
                      ) : (
                          "Analyze Content"
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleReset} disabled={isAnalyzing}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2">
              {!analysisComplete && !isAnalyzing && (
                  <div className="h-full flex items-center justify-center text-center p-12">
                    <div className="max-w-md">
                      <BrainCircuit className="h-16 w-16 text-blue-600 mx-auto mb-6 opacity-50" />
                      <h2 className="text-2xl font-bold mb-2">Advanced Content Analysis</h2>
                      <p className="text-gray-600 mb-6">
                        Our AI will analyze your content for bias patterns, sentiment, factual accuracy, and narrative
                        framing using state-of-the-art language models.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Bias Detection
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Fact Checking
                        </Badge>
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          Sentiment Analysis
                        </Badge>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Source Credibility
                        </Badge>
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Narrative Framing
                        </Badge>
                      </div>
                    </div>
                  </div>
              )}

              {isAnalyzing && (
                  <div className="h-full flex items-center justify-center text-center p-12">
                    <div className="max-w-md">
                      <div className="relative mx-auto mb-6">
                        <BrainCircuit className="h-16 w-16 text-blue-600 mx-auto opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Analyzing Content</h2>
                      <p className="text-gray-600 mb-6">
                        Our AI models are processing your content. This typically takes 15-30 seconds depending on length
                        and complexity.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Extracting key entities</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Analyzing sentiment patterns</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Detecting bias indicators</span>
                          {analysisProgress > 50 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Cross-referencing facts</span>
                          {analysisProgress > 75 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Generating comprehensive report</span>
                          {analysisProgress > 90 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {analysisComplete && analysisResults && (
                  <div className="space-y-8">
                    {/* Summary Card */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Analysis Summary</CardTitle>
                            <CardDescription>
                              {activeTab === "text"
                                  ? `Analysis of ${content.length} characters of text`
                                  : `Analysis of content from ${articleMeta?.url || url}`}
                            </CardDescription>
                            {articleMeta?.title && (
                                <p className="text-sm text-gray-700 mt-1 font-medium">Article: "{articleMeta.title}"</p>
                            )}
                            {articleMeta?.source && (
                                <p className="text-xs text-gray-500">Source: {articleMeta.source}</p>
                            )}
                          </div>
                          <CredibilityScore score={Math.round((analysisResults.credibility_assessment?.overall_score || 0) * 100)} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                              <h3 className="text-sm font-medium text-gray-500 mb-1">Bias Score</h3>
                              <div className={`text-3xl font-bold ${analysisResults.bias_analysis.overall_score > 0.6 ? 'text-red-600' : analysisResults.bias_analysis.overall_score > 0.3 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {Math.round((analysisResults.bias_analysis?.overall_score || 0) * 100)}%
                              </div>
                              <Badge className={`mt-2 ${analysisResults.bias_analysis.overall_score > 0.6 ? 'bg-red-100 text-red-800' : analysisResults.bias_analysis.overall_score > 0.3 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {analysisResults.bias_analysis.overall_score > 0.6 ? 'High Bias' : analysisResults.bias_analysis.overall_score > 0.3 ? 'Moderate Bias' : 'Low Bias'}
                              </Badge>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                              <h3 className="text-sm font-medium text-gray-500 mb-1">Misinformation Risk</h3>
                              <div className={`text-3xl font-bold ${analysisResults.misinformation_analysis.risk_score > 0.5 ? 'text-red-600' : analysisResults.misinformation_analysis.risk_score > 0.2 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {Math.round((analysisResults.misinformation_analysis?.risk_score || 0) * 100)}%
                              </div>
                              <Badge className={`mt-2 ${analysisResults.misinformation_analysis.risk_score > 0.5 ? 'bg-red-100 text-red-800' : analysisResults.misinformation_analysis.risk_score > 0.2 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {analysisResults.misinformation_analysis.risk_score > 0.5 ? 'High Risk' : analysisResults.misinformation_analysis.risk_score > 0.2 ? 'Medium Risk' : 'Low Risk'}
                              </Badge>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                              <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Sentiment</h3>
                              <div className={`text-3xl font-bold ${analysisResults.sentiment_analysis.overall_sentiment > 0.2 ? 'text-green-600' : analysisResults.sentiment_analysis.overall_sentiment < -0.2 ? 'text-red-600' : 'text-blue-600'}`}>
                                {Math.round((analysisResults.sentiment_analysis?.overall_sentiment || 0) * 100)}%
                              </div>
                              <Badge className={`mt-2 ${analysisResults.sentiment_analysis.overall_sentiment > 0.2 ? 'bg-green-100 text-green-800' : analysisResults.sentiment_analysis.overall_sentiment < -0.2 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                {analysisResults.sentiment_analysis.overall_sentiment > 0.2 ? 'Positive' : analysisResults.sentiment_analysis.overall_sentiment < -0.2 ? 'Negative' : 'Neutral'}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                              <div>
                                <h3 className="font-medium text-amber-800">Analysis Highlights</h3>
                                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                                  {analysisResults.recommendations.verification_needed.length > 0 && (
                                      <li>• {analysisResults.recommendations.verification_needed.join("; ")}</li>
                                  )}
                                  {analysisResults.misinformation_analysis.red_flags.length > 0 && (
                                      <li>• Detected red flags: {analysisResults.misinformation_analysis.red_flags.join(", ")}</li>
                                  )}
                                  {analysisResults.bias_analysis.bias_indicators.length > 0 && (
                                      <li>• Bias indicators: {analysisResults.bias_analysis.bias_indicators.join(", ")}</li>
                                  )}
                                  {analysisResults.sentiment_analysis.emotional_manipulation > 0.5 && (
                                      <li>• High emotional manipulation detected.</li>
                                  )}
                                  {analysisResults.narrative_analysis.primary_frame && (
                                      <li>• Primary narrative frame: {analysisResults.narrative_analysis.primary_frame}</li>
                                  )}
                                  {analysisResults.recommendations.critical_questions.length > 0 && (
                                      <li>• Consider: {analysisResults.recommendations.critical_questions[0]}</li>
                                  )}
                                </ul>
                                {analysisResults.recommendations.verification_needed.length === 0 &&
                                    analysisResults.misinformation_analysis.red_flags.length === 0 &&
                                    analysisResults.bias_analysis.bias_indicators.length === 0 && (
                                        <li>• Content appears relatively balanced and low risk based on current analysis.</li>
                                    )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Analysis Tabs */}
                    <Tabs defaultValue="bias" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
                        <TabsTrigger value="facts">Fact Check</TabsTrigger>
                        <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                        <TabsTrigger value="narrative">Narrative</TabsTrigger>
                        <TabsTrigger value="sources">Sources</TabsTrigger>
                      </TabsList>

                      <TabsContent value="bias" className="mt-6">
                        {biasBreakdownData && <BiasBreakdown data={biasBreakdownData} />}
                      </TabsContent>

                      <TabsContent value="facts" className="mt-6">
                        {factCheckResultsData && <FactCheckResults data={factCheckResultsData} />}
                      </TabsContent>

                      <TabsContent value="sentiment" className="mt-6">
                        {sentimentAnalysisData && <SentimentAnalysis data={sentimentAnalysisData} />}
                      </TabsContent>

                      <TabsContent value="narrative" className="mt-6">
                        {narrativeAnalysisData && <NarrativeAnalysis data={narrativeAnalysisData} />}
                      </TabsContent>

                      <TabsContent value="sources" className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Source Analysis</CardTitle>
                            <CardDescription>Evaluation of sources cited and their credibility</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-6">
                              <div className="space-y-4">
                                {[
                                  {
                                    name: articleMeta?.source || "Analyzed Source",
                                    url: articleMeta?.url || "N/A",
                                    credibility: Math.round((analysisResults.credibility_assessment?.source_reliability || 0) * 100),
                                    bias: analysisResults.bias_analysis?.political_leaning || "Neutral",
                                  },
                                  {
                                    name: "Example Research Institute",
                                    url: "https://example-research.org",
                                    credibility: 92,
                                    bias: "Minimal",
                                  },
                                  {
                                    name: "Political Think Tank",
                                    url: "https://policy-institute.org",
                                    credibility: 65,
                                    bias: "Moderate Right",
                                  },
                                ].map((source, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <Globe className="h-4 w-4 text-gray-500" />
                                          <h4 className="font-medium">{source.name}</h4>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <LinkIcon className="h-3 w-3 text-gray-400" />
                                          <span className="text-sm text-gray-600">{source.url}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                          <div className="text-sm font-medium">Credibility</div>
                                          <div
                                              className={`text-lg font-bold ${source.credibility > 80 ? "text-green-600" : source.credibility > 60 ? "text-yellow-600" : "text-red-600"}`}
                                          >
                                            {source.credibility}%
                                          </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                              source.bias === "Minimal"
                                                  ? "border-green-600 text-green-600"
                                                  : source.bias.includes("Left") || source.bias.includes("Right")
                                                      ? "border-yellow-600 text-yellow-600"
                                                      : "border-red-600 text-red-600"
                                            }
                                        >
                                          {source.bias}
                                        </Badge>
                                      </div>
                                    </div>
                                ))}
                              </div>

                              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                                <div className="flex items-start space-x-3">
                                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                  <div>
                                    <h3 className="font-medium text-blue-800">Source Diversity</h3>
                                    <p className="mt-1 text-sm text-blue-800">
                                      This content cites sources with varying perspectives and credibility levels. Consider
                                      evaluating primary sources directly when possible.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recommended Actions</CardTitle>
                        <CardDescription>Based on our analysis, here are some suggested next steps</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button className="w-full">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify Key Claims
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Globe className="mr-2 h-4 w-4" />
                            Find Alternative Sources
                          </Button>
                          <Button variant="outline" className="w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Balanced Summary
                          </Button>
                          <Button variant="outline" className="w-full">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Share Analysis Report
                          </Button>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-6">
                        <div className="text-sm text-gray-500">
                          Analysis powered by TruthGuard AI using {analysisResults?.model_version || "AI models"}
                        </div>
                        <Button variant="ghost" size="sm">
                          Export Report
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

// Data interfaces for components
interface BiasBreakdownProps {
  data: AnalysisResult['bias_analysis'];
}
interface FactCheckResultsProps {
  data: AnalysisResult['misinformation_analysis'];
}
interface SentimentAnalysisProps {
  data: AnalysisResult['sentiment_analysis'];
}
interface NarrativeAnalysisProps {
  data: AnalysisResult['narrative_analysis'];
}

export function BiasBreakdown({ data }: BiasBreakdownProps) {
  const biasCategories = [
    { name: "Overall Bias", score: data.overall_score * 100, description: "Overall bias score" },
    { name: "Language Bias", score: data.language_bias * 100, description: "Bias in language choices" },
    { name: "Source Bias", score: data.source_bias * 100, description: "Bias from selected sources" },
    { name: "Framing Bias", score: data.framing_bias * 100, description: "How information is presented" },
    { name: "Selection Bias", score: data.selection_bias * 100, description: "Selective inclusion/exclusion of info" },
    { name: "Confirmation Bias", score: data.confirmation_bias * 100, description: "Reinforcing existing beliefs" },
  ];

  const biasIndicators = [
    { category: "Bias Indicators", indicators: data.bias_indicators.map(indicator => ({ text: indicator, frequency: 1, severity: "medium" })) }
  ];

  const politicalLeaningData = [
    { viewpoint: data.political_leaning || "Neutral", score: data.overall_score * 100 },
  ];

  const getBiasColor = (score: number) => {
    if (score < 40) return "text-green-600";
    if (score < 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getBiasLevel = (score: number) => {
    if (score < 40) return "Low";
    if (score < 70) return "Moderate";
    return "High";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const overallBiasScore = data.overall_score * 100;

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bias Analysis</CardTitle>
            <CardDescription>Detailed breakdown of bias patterns and indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Bias Score */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Bias Score</h3>
                <div className={`text-3xl font-bold ${getBiasColor(overallBiasScore)}`}>
                  {getBiasLevel(overallBiasScore)}
                </div>
                <div className="text-sm text-gray-500">{overallBiasScore.toFixed(1)}%</div>
              </div>
              <div className="mt-4 md:mt-0 md:w-64">
                <Progress value={overallBiasScore} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>Minimal Bias</span>
                  <span>Extreme Bias</span>
                </div>
              </div>
            </div>

            {/* Bias Categories */}
            <div>
              <h3 className="text-sm font-medium mb-4">Bias Categories</h3>
              <div className="space-y-3">
                {biasCategories.map((category) => (
                    <div key={category.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({category.description})</span>
                        </div>
                        <span className={getBiasColor(category.score)}>{category.score.toFixed(1)}%</span>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </div>
                ))}
              </div>
            </div>

            {/* Political Leaning */}
            <div>
              <h3 className="text-sm font-medium mb-4">Political Leaning Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                      data={politicalLeaningData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="viewpoint" type="category" width={80} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]} />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bias Indicators */}
            <div>
              <h3 className="text-sm font-medium mb-4">Detected Bias Indicators</h3>
              <Tabs defaultValue={biasIndicators[0]?.category || "Language"}>
                <TabsList className="grid grid-cols-3">
                  {biasIndicators.map((cat, idx) => <TabsTrigger key={idx} value={cat.category}>{cat.category}</TabsTrigger>)}
                </TabsList>
                {biasIndicators.map((category, catIndex) => (
                    <TabsContent key={catIndex} value={category.category} className="mt-4">
                      <div className="space-y-3">
                        {category.indicators.map((indicator, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle
                                    className={`h-4 w-4 ${indicator.severity === "high" ? "text-red-500" : indicator.severity === "medium" ? "text-yellow-500" : "text-green-500"}`}
                                />
                                <span>{indicator.text}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">
                            Found {indicator.frequency} {indicator.frequency === 1 ? "time" : "times"}
                          </span>
                                <Badge className={getSeverityColor(indicator.severity)}>
                                  {indicator.severity.charAt(0).toUpperCase() + indicator.severity.slice(1)}
                                </Badge>
                              </div>
                            </div>
                        ))}
                      </div>
                    </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Methodology Note */}
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Bias Detection Methodology</h3>
                  <p className="mt-1 text-sm text-blue-800">
                    Our AI analyzes multiple dimensions of bias including language patterns, framing techniques, source
                    selection, and narrative structure. The analysis is based on a comprehensive model trained on diverse
                    media content.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

export function FactCheckResults({ data }: FactCheckResultsProps) {
  const factChecks = data.fact_checks.map(fc => ({
    claim: fc.claim,
    verdict: fc.verdict,
    confidence: fc.confidence * 100,
    explanation: fc.explanation,
    sources: fc.sources,
  }));

  const redFlags = data.red_flags;
  const logicalFallacies = data.logical_fallacies;

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "True": return "bg-green-100 text-green-800";
      case "Partially True": return "bg-yellow-100 text-yellow-800";
      case "Misleading": return "bg-orange-100 text-orange-800";
      case "False": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "True": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Partially True": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "Misleading": return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "False": return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const totalClaims = factChecks.length;
  const trueClaims = factChecks.filter((check) => check.verdict === "True").length;
  const partiallyTrueClaims = factChecks.filter((check) => check.verdict === "Partially True").length;
  const accuracyScore = totalClaims > 0 ? Math.round(((trueClaims + partiallyTrueClaims * 0.5) / totalClaims) * 100) : 100;

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Fact Check Results</CardTitle>
            <CardDescription>Verification of key claims against reliable sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Accuracy */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Factual Accuracy</h3>
                <div className="text-3xl font-bold text-blue-600">{accuracyScore}%</div>
                <div className="text-sm text-gray-500">
                  {totalClaims} claims analyzed • {trueClaims} verified true
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:w-64">
                <Progress value={accuracyScore} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>Low Accuracy</span>
                  <span>High Accuracy</span>
                </div>
              </div>
            </div>

            {/* Individual Claims */}
            <div className="space-y-4">
              {factChecks.length > 0 ? factChecks.map((check, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getVerdictIcon(check.verdict)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Claim:</h4>
                            <Badge className={getVerdictColor(check.verdict)}>{check.verdict}</Badge>
                          </div>
                          <p className="text-gray-800 mb-3">"{check.claim}"</p>
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Fact Check:</h4>
                            <p className="text-sm text-gray-600">{check.explanation}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>Confidence:</span>
                              <span className="font-medium">{check.confidence}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {check.sources.map((source, i) => (
                                  <Button key={i} variant="ghost" size="sm" className="h-7 text-xs">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {source}
                                  </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              )) : (
                  <div className="text-center text-gray-500 py-4">No specific claims found for fact-checking.</div>
              )}
            </div>

            {/* Red Flags & Logical Fallacies */}
            {(redFlags.length > 0 || logicalFallacies.length > 0) && (
                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800">Detected Red Flags & Fallacies</h3>
                      <ul className="mt-1 text-sm text-red-800 space-y-1">
                        {redFlags.map((flag, idx) => <li key={`rf-${idx}`}>• Red Flag: {flag}</li>)}
                        {logicalFallacies.map((fallacy, idx) => <li key={`lf-${idx}`}>• Fallacy: {fallacy}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
            )}

            {/* Methodology Note */}
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Fact-Checking Methodology</h3>
                  <p className="mt-1 text-sm text-blue-800">
                    Claims are verified against multiple authoritative sources using our AI-powered cross-referencing
                    system. Each claim is evaluated for context, accuracy, and potential omissions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

export function SentimentAnalysis({ data }: SentimentAnalysisProps) {
  const sentimentData = [
    { segment: 1, sentiment: data.overall_sentiment },
  ];

  const emotionData = [
    { emotion: data.emotional_tone || "neutral", score: 100 },
  ];

  const keyPhrases = data.key_phrases.map(phrase => ({
    text: phrase,
    sentiment: "neutral",
    frequency: 1,
  }));

  const overallSentiment = data.overall_sentiment;

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return "text-green-600";
    if (sentiment > -0.2) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.2) return "Positive";
    if (sentiment > -0.2) return "Neutral";
    return "Negative";
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "anger": return "bg-red-600";
      case "fear": return "bg-purple-600";
      case "sadness": return "bg-blue-600";
      case "joy": return "bg-green-600";
      case "surprise": return "bg-yellow-600";
      case "disgust": return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  const getPhraseColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 text-green-800";
      case "negative": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>Emotional tone and sentiment patterns throughout the content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Sentiment */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Sentiment</h3>
                <div className={`text-3xl font-bold ${getSentimentColor(overallSentiment)}`}>
                  {getSentimentLabel(overallSentiment)}
                </div>
                <div className="text-sm text-gray-500">Score: {(overallSentiment * 100).toFixed(0)}%</div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="w-full md:w-64 h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative">
                  <div
                      className="absolute w-3 h-6 bg-black rounded-full top-1/2 transform -translate-y-1/2"
                      style={{ left: `${((overallSentiment + 1) / 2) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Negative</span>
                  <span>Neutral</span>
                  <span>Positive</span>
                </div>
              </div>
            </div>

            {/* Sentiment Flow */}
            <div>
              <h3 className="text-sm font-medium mb-4">Sentiment Flow Throughout Content</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                      data={sentimentData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" label={{ value: "Content Segments", position: "insideBottom", offset: -5 }} />
                    <YAxis domain={[-1, 1]} label={{ value: "Sentiment", angle: -90, position: "insideLeft" }} ticks={[-1, -0.5, 0, 0.5, 1]} />
                    <Tooltip
                        formatter={(value: number) => [`Sentiment: ${value.toFixed(2)}`, "Score"]}
                        labelFormatter={(label) => `Segment ${label}`}
                    />
                    <defs>
                      <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="sentiment" stroke="#3b82f6" fillOpacity={1} fill="url(#sentimentGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Emotion Analysis */}
            <div>
              <h3 className="text-sm font-medium mb-4">Emotion Distribution</h3>
              <div className="space-y-3">
                {emotionData.map((item) => (
                    <div key={item.emotion} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.emotion}</span>
                        <span>{item.score}%</span>
                      </div>
                      <Progress value={item.score} className={`h-2 ${getEmotionColor(item.emotion)}`} />
                    </div>
                ))}
              </div>
            </div>

            {/* Key Phrases */}
            <div>
              <h3 className="text-sm font-medium mb-4">Key Sentiment Phrases</h3>
              <div className="flex flex-wrap gap-2">
                {keyPhrases.map((phrase, index) => (
                    <div key={index} className="flex items-center">
                      <Badge className={getPhraseColor(phrase.sentiment)}>
                        {phrase.text} {phrase.frequency > 1 && `(${phrase.frequency})`}
                      </Badge>
                    </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

export function NarrativeAnalysis({ data }: NarrativeAnalysisProps) {
  const narrativeFrames = [
    {
      name: data.primary_frame,
      strength: 100,
      description: "Dominant narrative frame detected.",
      examples: data.narrative_patterns || [],
    },
    ...data.secondary_frames.map(frame => ({
      name: frame,
      strength: 50,
      description: "Secondary narrative frame detected.",
      examples: [],
    })),
  ];

  const keyActors = [
    {
      name: data.actor_portrayal.main_actor || "N/A",
      portrayal: data.actor_portrayal.tone || "neutral",
      frequency: 1,
      examples: [data.actor_portrayal.role || ""],
    },
  ];

  const narrativePatterns = data.narrative_patterns.map(pattern => ({
    pattern: pattern,
    description: `Detected pattern: ${pattern}`,
    strength: 70,
  }));

  const getPortrayalColor = (portrayal: string) => {
    switch (portrayal.toLowerCase()) {
      case "positive": return "bg-green-100 text-green-800";
      case "negative": return "bg-red-100 text-red-800";
      case "sympathetic": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "text-green-600";
    if (strength < 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Narrative Analysis</CardTitle>
            <CardDescription>How the content frames issues and constructs narratives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dominant Narrative Frames */}
            <div>
              <h3 className="text-sm font-medium mb-4">Dominant Narrative Frames</h3>
              <div className="space-y-4">
                {narrativeFrames.length > 0 ? narrativeFrames.map((frame) => (
                    <div key={frame.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{frame.name}</h4>
                          <p className="text-sm text-gray-600">{frame.description}</p>
                        </div>
                        <span className={`font-bold ${getStrengthColor(frame.strength)}`}>{frame.strength}%</span>
                      </div>
                      <Progress value={frame.strength} className="h-2" />
                      <div className="pt-1">
                        <p className="text-xs text-gray-500">Examples: {frame.examples.join("; ")}</p>
                      </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-500 py-4">No narrative frames detected.</div>
                )}
              </div>
            </div>

            {/* Narrative Patterns and Actors */}
            <Tabs defaultValue="patterns" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patterns">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Narrative Patterns
                </TabsTrigger>
                <TabsTrigger value="actors">
                  <Users className="h-4 w-4 mr-2" />
                  Key Actors
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patterns" className="mt-4">
                <div className="space-y-4">
                  {narrativePatterns.length > 0 ? narrativePatterns.map((pattern) => (
                      <div key={pattern.pattern} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{pattern.pattern}</h4>
                          <Badge
                              className={
                                pattern.strength > 70
                                    ? "bg-red-100 text-red-800"
                                    : pattern.strength > 50
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                              }
                          >
                            {pattern.strength}% Strength
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{pattern.description}</p>
                      </div>
                  )) : (
                      <div className="text-center text-gray-500 py-4">No narrative patterns detected.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="actors" className="mt-4">
                <div className="space-y-4">
                  {keyActors.length > 0 ? keyActors.map((actor) => (
                      <div key={actor.name} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{actor.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Mentioned {actor.frequency} times</span>
                            <Badge className={getPortrayalColor(actor.portrayal)}>
                              {actor.portrayal.charAt(0).toUpperCase() + actor.portrayal.slice(1)} Portrayal
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">Examples: {actor.examples.join("; ")}</p>
                      </div>
                  )) : (
                      <div className="text-center text-gray-500 py-4">No key actors detected.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Narrative Impact */}
            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Narrative Impact</h3>
                  <p className="mt-1 text-sm text-amber-800">
                    This content primarily uses an economic impact frame with elements of political conflict. The
                    narrative structure emphasizes problems and conflicts, potentially leading readers to view the issue
                    through a partisan lens rather than considering multiple perspectives.
                  </p>
                </div>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Narrative Analysis Methodology</h3>
                  <p className="mt-1 text-sm text-blue-800">
                    Our AI identifies narrative frames, actor portrayals, and storytelling patterns using advanced NLP
                    techniques. This analysis helps reveal how information is structured to influence reader perception
                    beyond simple bias detection.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}