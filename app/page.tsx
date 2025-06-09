import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Search, Brain, Zap, BarChart3, Globe, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Shield className="h-12 w-12 text-blue-600" />
            <span className="text-2xl font-bold text-gray-400">×</span>
            <Database className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            TruthGuard × MongoDB
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            AI-powered media bias and misinformation detection using MongoDB's intelligent data platform. Analyze news
            articles in real-time with advanced vector search and Google AI integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/mongodb-showcase">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                <Database className="mr-2 h-5 w-5" />
                MongoDB Demo
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="px-8 py-3">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* MongoDB Challenge Badge */}
          {/* <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Database className="h-4 w-4" />
            <span>Built for MongoDB Hackathon Challenge</span>
            <Badge variant="secondary" className="bg-green-200 text-green-800">
              $12,500 Prize
            </Badge>
          </div> */}
        </div>
      </section>

      {/* Problem Statement */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl mx-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Solving Real-World Media Challenges</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            In today's information age, media bias and misinformation pose significant threats to informed
            decision-making. TruthGuard leverages MongoDB's powerful data platform to provide real-time analysis and
            insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">The Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-red-700">
                <li>• Media bias influences public opinion</li>
                <li>• Misinformation spreads rapidly</li>
                <li>• Lack of real-time analysis tools</li>
                <li>• Difficulty comparing sources</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Our Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• AI-powered bias detection</li>
                <li>• Real-time content analysis</li>
                <li>• Semantic search capabilities</li>
                <li>• Comprehensive source comparison</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">The Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Informed media consumption</li>
                <li>• Reduced misinformation spread</li>
                <li>• Enhanced media literacy</li>
                <li>• Data-driven insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* MongoDB Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powered by MongoDB's Intelligent Data Platform</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            TruthGuard showcases MongoDB's advanced capabilities for AI-driven applications and real-time analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Search className="h-8 w-8 text-green-600" />
                <CardTitle>Vector Search</CardTitle>
              </div>
              <CardDescription>Semantic similarity search using AI-generated embeddings</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Atlas Vector Search integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Google AI embeddings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Intelligent content discovery</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <CardTitle>Aggregation Pipeline</CardTitle>
              </div>
              <CardDescription>Complex analytics and data transformations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Advanced data processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Statistical operations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Real-time analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-purple-600" />
                <CardTitle>Real-time Processing</CardTitle>
              </div>
              <CardDescription>Live data ingestion and change streams</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Change streams monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Live data updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Instant notifications</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Brain className="h-8 w-8 text-orange-600" />
                <CardTitle>AI Integration</CardTitle>
              </div>
              <CardDescription>Google Cloud AI for content analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  <span>Gemini 1.5 Pro analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  <span>Bias detection algorithms</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  <span>Sentiment analysis</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-teal-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8 text-teal-600" />
                <CardTitle>Atlas Search</CardTitle>
              </div>
              <CardDescription>Full-text search with advanced filtering</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span>Faceted search capabilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span>Auto-complete features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span>Relevance scoring</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-indigo-600" />
                <CardTitle>Time Series</CardTitle>
              </div>
              <CardDescription>Temporal data analysis and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                  <span>Trend analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                  <span>Historical comparisons</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                  <span>Pattern recognition</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dataset Information */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-3xl mx-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Public Dataset & AI Analysis</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            TruthGuard processes real news articles from major sources, applying AI analysis to detect bias and
            misinformation patterns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-blue-600" />
                <span>News Sources Dataset</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Reuters</span>
                  <Badge variant="outline">International</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Associated Press</span>
                  <Badge variant="outline">Wire Service</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>BBC News</span>
                  <Badge variant="outline">Public Media</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>CNN</span>
                  <Badge variant="outline">Cable News</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fox News</span>
                  <Badge variant="outline">Cable News</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>NPR</span>
                  <Badge variant="outline">Public Radio</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-green-600" />
                <span>AI Analysis Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Bias Detection</span>
                  <Badge variant="secondary">Google AI</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sentiment Analysis</span>
                  <Badge variant="secondary">NLP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fact Checking</span>
                  <Badge variant="secondary">Verification</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Narrative Analysis</span>
                  <Badge variant="secondary">Framing</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Credibility Scoring</span>
                  <Badge variant="secondary">Trust Metrics</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Topic Classification</span>
                  <Badge variant="secondary">Categorization</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Experience TruthGuard in Action</h2>
          <p className="text-gray-600 mb-8">
            Explore how MongoDB's intelligent data platform powers real-time media analysis and bias detection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mongodb-showcase">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                <Database className="mr-2 h-5 w-5" />
                Try MongoDB Demo
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="px-8 py-3">
                <Search className="mr-2 h-5 w-5" />
                Search Articles
              </Button>
            </Link>
            <Link href="/analyze">
              <Button size="lg" variant="outline" className="px-8 py-3">
                <Zap className="mr-2 h-5 w-5" />
                Analyze Content
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
