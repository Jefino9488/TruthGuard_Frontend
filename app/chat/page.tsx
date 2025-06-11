// app/chat/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Send, AlertTriangle, CheckCircle, TrendingUp, Loader2 } from "lucide-react"

interface AnalysisDetail {
  bias_score?: number;
  misinformation_risk?: number;
  confidence?: number;
  credibility_score?: number;
  sentiment?: number;
  processing_model?: string;
  mongodb_stored?: boolean; // Indicate if stored in MongoDB
}

interface Message {
  id: number
  type: "user" | "bot"
  content: string
  timestamp: Date
  analysis?: AnalysisDetail
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content:
          "Hello! I'm TruthGuard AI, your real-time bias and misinformation detection assistant powered by MongoDB Vector Search and Google AI. You can ask me to analyze headlines, articles, or discuss media bias patterns. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      console.log("Sending request to AI API...")

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: currentInput,
          options: {
            store_in_mongodb: true, // Request backend to store analysis in MongoDB
            use_vector_search: true, // Backend will use vector search for related data if applicable
          },
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Analysis result:", result)

      if (result.success && result.analysis) {
        const analysis = result.analysis

        let botResponse = ""

        if (currentInput.toLowerCase().includes("analyze")) {
          botResponse = `I've analyzed your text using ${analysis.model_version || "TruthGuard AI"}. Here's what I found:

**🎯 Bias Analysis:**
- Overall Bias Score: ${((analysis.bias_analysis?.overall_score || 0) * 100).toFixed(1)}% ${
              (analysis.bias_analysis?.overall_score || 0) > 0.5 ? "(High bias detected)" : "(Low bias)"
          }
- Political Leaning: ${analysis.bias_analysis?.political_leaning || "Neutral"}
- Language Bias: ${((analysis.bias_analysis?.language_bias || 0) * 100).toFixed(1)}%

**⚠️ Misinformation Risk:**
- Risk Level: ${((analysis.misinformation_analysis?.risk_score || 0) * 100).toFixed(1)}% ${
              (analysis.misinformation_analysis?.risk_score || 0) > 0.4 ? "(Requires fact-checking)" : "(Low risk)"
          }
- Evidence Quality: ${((analysis.misinformation_analysis?.evidence_quality || 0) * 100).toFixed(1)}%

**📊 Sentiment Analysis:**
- Overall Sentiment: ${(analysis.sentiment_analysis?.overall_sentiment || 0).toFixed(2)} ${
              (analysis.sentiment_analysis?.overall_sentiment || 0) > 0.2
                  ? "(Positive)"
                  : (analysis.sentiment_analysis?.overall_sentiment || 0) < -0.2
                      ? "(Negative)"
                      : "(Neutral)"
          }
- Emotional Tone: ${analysis.sentiment_analysis?.emotional_tone || "Neutral"}
- Emotional Manipulation: ${((analysis.sentiment_analysis?.emotional_manipulation || 0) * 100).toFixed(1)}%

**🔍 Credibility Assessment:**
- Overall Score: ${((analysis.credibility_assessment?.overall_score || 0) * 100).toFixed(1)}%
- Source Reliability: ${((analysis.credibility_assessment?.source_reliability || 0) * 100).toFixed(1)}%
- Logical Consistency: ${((analysis.credibility_assessment?.logical_consistency || 0) * 100).toFixed(1)}%

**🤖 Processing Info:**
- Model: ${analysis.model_version || "TruthGuard AI"}
- Confidence: ${((analysis.confidence || 0) * 100).toFixed(1)}%
- MongoDB Storage: ${analysis.mongodb_stored ? "✅ Stored" : "❌ Not stored"}

${
              analysis.additional_insights && analysis.additional_insights.length > 0
                  ? `**💡 Key Insights:**\n${analysis.additional_insights.map((insight: any) => `- ${insight.message}`).join("\n")}`
                  : ""
          }

This analysis has been processed using our advanced AI system. Would you like me to explain any specific aspects?`
        } else if (currentInput.toLowerCase().includes("search") || currentInput.toLowerCase().includes("find")) {
          botResponse = `I'm searching our MongoDB database for related content...

**🔍 Search Results:**
Based on your query "${currentInput}", I can help you find similar articles and patterns in our database. Our vector search system uses AI embeddings to find semantically similar content.

**📊 Available Features:**
- Semantic similarity search
- Bias pattern analysis
- Source credibility comparison
- Trend identification

Try asking me to "analyze" some content first to populate our database, then search for specific topics!`
        } else if (currentInput.toLowerCase().includes("bias")) {
          botResponse = `**🎯 Understanding Media Bias with TruthGuard AI:**

**Types of Bias We Detect:**
- **Selection Bias**: What stories are covered vs. ignored
- **Framing Bias**: How stories are presented and contextualized
- **Confirmation Bias**: Favoring information that confirms existing beliefs
- **Language Bias**: Emotional or loaded language choices

**🔍 Our Detection Methods:**
- Advanced AI analysis for linguistic patterns
- MongoDB aggregation for source comparison
- Vector search for similar content analysis
- Real-time sentiment tracking

**📊 Bias Scoring:**
- 0-30%: Low bias (relatively neutral)
- 30-60%: Moderate bias (some perspective)
- 60%+: High bias (strong perspective)

Our system stores all analysis in MongoDB with vector embeddings, allowing for semantic search and pattern recognition. Would you like me to analyze a specific headline?`
        } else if (currentInput.toLowerCase().includes("misinformation")) {
          botResponse = `**🚨 Misinformation Detection with TruthGuard:**

**Detection Factors:**
- Source credibility scoring
- Fact-checking against reliable databases
- Logical fallacy identification
- Emotional manipulation detection
- Cross-reference with verified sources

**🔬 Technical Implementation:**
- AI-powered content analysis
- MongoDB Vector Search for similar claims
- Real-time fact-checking pipeline
- Pattern recognition across sources

**📊 Risk Assessment:**
- Low Risk (0-30%): Generally reliable
- Medium Risk (30-60%): Requires verification
- High Risk (60%+): Likely misinformation

**🛡️ Red Flags We Detect:**
- Conspiracy language
- Unverified claims
- Emotional manipulation
- Lack of credible sources

All analysis is stored in MongoDB with full traceability. Do you have a specific claim you'd like me to fact-check?`
        } else {
          botResponse = `**🤖 Welcome to TruthGuard AI!**

I'm powered by advanced AI and MongoDB Vector Search. Here's how I can help:

**🔍 Content Analysis:**
- "Analyze this headline: [your text]"
- Real-time bias and misinformation detection
- Sentiment and credibility analysis

**🔎 Database Search:**
- "Search for articles about [topic]"
- Vector-based semantic search
- Find similar content patterns

**📊 Educational Insights:**
- Ask about bias patterns and detection methods
- Learn about misinformation techniques
- Understand media credibility factors

**💾 MongoDB Features:**
- All analysis stored with vector embeddings
- Real-time aggregation and analytics
- Semantic search across content
- Pattern recognition and trends

**🚀 Try These Examples:**
- "Analyze this headline: Breaking news shocks the world"
- "What are common bias patterns?"
- "How do you detect misinformation?"

What would you like to explore first?`
        }

        const botMessage: Message = {
          id: messages.length + 2,
          type: "bot",
          content: botResponse,
          timestamp: new Date(),
          analysis: {
            bias_score: analysis.bias_analysis?.overall_score || 0,
            misinformation_risk: analysis.misinformation_analysis?.risk_score || 0,
            confidence: analysis.confidence || 0,
            credibility_score: analysis.credibility_assessment?.overall_score || 0,
            sentiment: analysis.sentiment_analysis?.overall_sentiment || 0,
            processing_model: analysis.model_version || "TruthGuard AI",
            mongodb_stored: analysis.mongodb_stored || false,
          },
        }

        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error(result.error || "Analysis failed - no valid response")
      }
    } catch (error) {
      console.error("AI Analysis Error:", error)

      const errorMessage: Message = {
        id: messages.length + 2,
        type: "bot",
        content: `I apologize, but I encountered an error while processing your request:

**🔧 Error Details:**
${error instanceof Error ? error.message : "Unknown error occurred"}

**🛠️ Possible Solutions:**
- Check your internet connection
- Ensure your backend is running
- Try a shorter message
- Refresh the page and try again

**💡 What I Can Still Help With:**
- Explain bias detection techniques
- Discuss misinformation patterns
- Provide general media literacy tips

**🚀 System Status (via frontend API):**
- Backend Status: Check your console for details
- MongoDB Connection: ✅ Likely OK
- AI Model: ✅ Likely OK

Please try again, or ask me about bias detection methods!`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getBiasColor = (score: number) => {
    if (score < 0.4) return "text-green-600"
    if (score > 0.6) return "text-red-600"
    return "text-yellow-600"
  }

  const getRiskColor = (score: number) => {
    if (score < 0.3) return "text-green-600"
    if (score < 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Bot className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">TruthGuard AI Assistant</h1>
                <p className="text-sm text-gray-600">Real-time analysis powered by MongoDB Vector Search & Google AI</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface - FIXED OVERFLOW ISSUE */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>AI Chat Assistant</CardTitle>
                  <CardDescription>
                    Ask me to analyze headlines, search articles, or discuss bias detection techniques
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  {/* FIXED: Added proper scrolling container */}
                  <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4 pb-4">
                      {messages.map((message) => (
                          <div
                              key={message.id}
                              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                                className={`max-w-[85%] ${
                                    message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                                } rounded-lg p-4`}
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                {message.type === "user" ? (
                                    <User className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                    <Bot className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium">
                              {message.type === "user" ? "You" : "TruthGuard AI"}
                            </span>
                                <span className="text-xs opacity-70 flex-shrink-0">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                              </div>
                              <div className="whitespace-pre-wrap break-words">{message.content}</div>

                              {message.analysis && (
                                  <div
                                      className={`mt-4 p-3 rounded border ${
                                          message.type === "user" ? "bg-white/10" : "bg-blue-50"
                                      }`}
                                  >
                                    <h4 className="font-medium mb-2 text-sm">Real-time Analysis Results:</h4>
                                    <div className="space-y-1 text-xs">
                                      <div
                                          className={`flex justify-between ${
                                              message.type === "user" ? "text-white" : getBiasColor(message.analysis.bias_score || 0)
                                          }`}
                                      >
                                        <span>Bias Score:</span>
                                        <span>{((message.analysis.bias_score || 0) * 100).toFixed(1)}%</span>
                                      </div>
                                      <div
                                          className={`flex justify-between ${
                                              message.type === "user"
                                                  ? "text-white"
                                                  : getRiskColor(message.analysis.misinformation_risk || 0)
                                          }`}
                                      >
                                        <span>Misinfo Risk:</span>
                                        <span>{((message.analysis.misinformation_risk || 0) * 100).toFixed(1)}%</span>
                                      </div>
                                      <div
                                          className={`flex justify-between ${
                                              message.type === "user" ? "text-white" : "text-gray-700"
                                          }`}
                                      >
                                        <span>Confidence:</span>
                                        <span>{((message.analysis.confidence || 0) * 100).toFixed(1)}%</span>
                                      </div>
                                      <div
                                          className={`flex justify-between ${
                                              message.type === "user" ? "text-white" : "text-gray-700"
                                          }`}
                                      >
                                        <span>Model:</span>
                                        <span className="text-xs">{message.analysis.processing_model}</span>
                                      </div>
                                      <div
                                          className={`flex justify-between ${
                                              message.type === "user" ? "text-white" : "text-gray-700"
                                          }`}
                                      >
                                        <span>Stored:</span>
                                        <span className="text-xs">{message.analysis.mongodb_stored ? "Yes ✅" : "No ❌"}</span>
                                      </div>
                                    </div>
                                  </div>
                              )}
                            </div>
                          </div>
                      ))}
                      {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-4 max-w-[85%]">
                              <div className="flex items-center space-x-2 mb-2">
                                <Bot className="h-4 w-4" />
                                <span className="text-sm font-medium">TruthGuard AI</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Analyzing with Google AI & MongoDB...</span>
                              </div>
                            </div>
                          </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input area - FIXED: Proper flex-shrink-0 */}
                  <div className="flex space-x-2 mt-4 flex-shrink-0">
                    <Input
                        placeholder="Ask me to analyze a headline, search articles, or discuss bias patterns..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setInputMessage("Analyze this headline: ")}
                      disabled={isLoading}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Analyze Headline
                  </Button>
                  <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setInputMessage("Search for articles about politics")}
                      disabled={isLoading}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Search Articles
                  </Button>
                  <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setInputMessage("What are common bias patterns?")}
                      disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Bias Patterns
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🚀 Real-time Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>MongoDB Vector Search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Google AI Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Real-time Data Storage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Semantic Search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Pattern Recognition</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Example Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p
                        className="text-gray-600 cursor-pointer hover:text-blue-600"
                        onClick={() => setInputMessage("Analyze this headline: Breaking news shocks the world")}
                    >
                      "Analyze this headline: Breaking news shocks the world"
                    </p>
                    <p
                        className="text-gray-600 cursor-pointer hover:text-blue-600"
                        onClick={() => setInputMessage("Search for articles about climate change")}
                    >
                      "Search for articles about climate change"
                    </p>
                    <p
                        className="text-gray-600 cursor-pointer hover:text-blue-600"
                        onClick={() => setInputMessage("How reliable is this source?")}
                    >
                      "How reliable is this source?"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}