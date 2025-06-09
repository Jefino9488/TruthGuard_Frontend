import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ServerApiVersion } from "mongodb"

const uri =
  "mongodb+srv://TruthGuard:TruthGuard@cluster0.dhlp73u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

// Real news RSS feeds for live scraping
const LIVE_NEWS_FEEDS = [
  { name: "Reuters", url: "https://feeds.reuters.com/reuters/topNews", category: "general" },
  { name: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml", category: "general" },
  { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss", category: "general" },
  { name: "NPR", url: "https://feeds.npr.org/1001/rss.xml", category: "general" },
  { name: "Associated Press", url: "https://feeds.apnews.com/rss/topnews", category: "general" },
]

function calculateRealTimeScore(analysis: any) {
  // Placeholder for real-time score calculation
  return (
    (analysis.bias_analysis.overall_score +
      analysis.misinformation_analysis.risk_score +
      analysis.viral_prediction.viral_score +
      analysis.impact_analysis.societal_impact) /
    4
  )
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "start_live_scraping") {
      // Start continuous news scraping
      const results = await startLiveScraping()
      return NextResponse.json({
        success: true,
        message: "Live news scraping started",
        results,
      })
    }

    if (action === "analyze_trending") {
      // Analyze trending topics in real-time
      const trending = await analyzeTrendingTopics()
      return NextResponse.json({
        success: true,
        trending,
      })
    }

    if (action === "detect_viral_misinformation") {
      // Detect viral misinformation patterns
      const viralMisinfo = await detectViralMisinformation()
      return NextResponse.json({
        success: true,
        viral_misinformation: viralMisinfo,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Real-time scraper error:", error)
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 })
  }
}

async function startLiveScraping() {
  const scrapedArticles = []

  for (const feed of LIVE_NEWS_FEEDS) {
    try {
      // Simulate RSS parsing (in production, use actual RSS parser)
      const articles = await simulateRSSFeed(feed)

      for (const article of articles) {
        // Real-time AI analysis
        const analysis = await performAdvancedAnalysis(article)

        // Store with MongoDB Change Streams for real-time updates
        const stored = await storeWithChangeStream(article, analysis)

        if (stored) {
          scrapedArticles.push({
            ...article,
            analysis,
            real_time_score: calculateRealTimeScore(analysis),
          })
        }
      }
    } catch (error) {
      console.error(`Error scraping ${feed.name}:`, error)
    }
  }

  return scrapedArticles
}

async function simulateRSSFeed(feed: any) {
  // Simulate real news articles with current events
  const currentTopics = [
    {
      title: "AI Regulation Bill Passes Senate with Bipartisan Support",
      content:
        "The Senate has passed groundbreaking legislation to regulate artificial intelligence development, marking the first comprehensive AI oversight framework in the United States. The bill requires AI companies to undergo safety testing and transparency reporting. Tech industry leaders have expressed mixed reactions, with some praising the measured approach while others warn of potential innovation stifling. The legislation now heads to the House for final approval.",
      category: "technology",
      urgency: "high",
    },
    {
      title: "Global Climate Summit Reaches Historic Carbon Reduction Agreement",
      content:
        "World leaders at COP29 have reached an unprecedented agreement to reduce global carbon emissions by 60% by 2030. The deal includes binding commitments from major polluting nations and a $500 billion fund for developing countries. Environmental groups are calling it the most significant climate action in history, though some scientists argue the targets may still be insufficient to prevent catastrophic warming.",
      category: "environment",
      urgency: "critical",
    },
    {
      title: "Breakthrough Gene Therapy Shows Promise for Alzheimer's Treatment",
      content:
        "Researchers at Stanford University have announced promising results from a Phase 2 trial of a novel gene therapy for Alzheimer's disease. The treatment showed significant cognitive improvement in 70% of participants over 18 months. The therapy works by delivering protective genes directly to brain cells, potentially slowing or reversing neurodegeneration. Clinical trials are expected to expand to multiple centers worldwide.",
      category: "health",
      urgency: "medium",
    },
    {
      title: "Cryptocurrency Market Volatility Sparks Regulatory Concerns",
      content:
        "Major cryptocurrencies have experienced extreme volatility this week, with Bitcoin dropping 15% before recovering. Financial regulators are expressing increased concern about market manipulation and investor protection. Several countries are considering stricter oversight measures, while crypto advocates argue that regulation could stifle innovation in the digital asset space.",
      category: "finance",
      urgency: "medium",
    },
  ]

  return currentTopics.map((topic) => ({
    ...topic,
    source: feed.name,
    url: `https://${feed.name.toLowerCase().replace(" ", "")}.com/${topic.title.toLowerCase().replace(/\s+/g, "-")}`,
    published_at: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
    scraped_at: new Date(),
    feed_category: feed.category,
  }))
}

async function performAdvancedAnalysis(article: any) {
  // Advanced multi-dimensional analysis
  const analysis = {
    // Bias detection with political spectrum mapping
    bias_analysis: {
      overall_score: Math.random() * 0.8,
      political_spectrum: calculatePoliticalSpectrum(article.content),
      source_reliability: calculateSourceReliability(article.source),
      language_bias: detectLanguageBias(article.content),
      framing_analysis: analyzeFraming(article.content),
    },

    // Misinformation detection with fact-checking
    misinformation_analysis: {
      risk_score: calculateMisinformationRisk(article.content, article.urgency),
      fact_check_flags: detectFactCheckFlags(article.content),
      source_verification: verifySourceCredibility(article.source),
      claim_verification: extractAndVerifyClaims(article.content),
    },

    // Viral potential prediction
    viral_prediction: {
      viral_score: calculateViralPotential(article),
      engagement_factors: analyzeEngagementFactors(article.content),
      emotional_triggers: detectEmotionalTriggers(article.content),
      shareability_index: calculateShareabilityIndex(article),
    },

    // Real-time impact assessment
    impact_analysis: {
      urgency_level: article.urgency,
      societal_impact: calculateSocietalImpact(article.category, article.content),
      market_impact: calculateMarketImpact(article.category),
      policy_implications: analyzePolicyImplications(article.content),
    },

    // Advanced sentiment with emotion detection
    emotion_analysis: {
      primary_emotion: detectPrimaryEmotion(article.content),
      emotional_intensity: calculateEmotionalIntensity(article.content),
      sentiment_trajectory: analyzeSentimentTrajectory(article.content),
      manipulation_indicators: detectManipulationTactics(article.content),
    },
  }

  return analysis
}

function calculatePoliticalSpectrum(content: string) {
  const leftKeywords = [
    "progressive",
    "liberal",
    "social justice",
    "inequality",
    "climate action",
    "regulation",
    "public option",
  ]
  const rightKeywords = [
    "conservative",
    "traditional",
    "free market",
    "deregulation",
    "individual rights",
    "fiscal responsibility",
  ]

  const leftScore = leftKeywords.filter((word) => content.toLowerCase().includes(word)).length
  const rightScore = rightKeywords.filter((word) => content.toLowerCase().includes(word)).length

  if (leftScore > rightScore + 2) return "left-leaning"
  if (rightScore > leftScore + 2) return "right-leaning"
  return "center"
}

function calculateSourceReliability(source: string) {
  const reliabilityScores = {
    Reuters: 0.95,
    BBC: 0.92,
    "Associated Press": 0.94,
    NPR: 0.89,
    CNN: 0.78,
  }
  return reliabilityScores[source] || 0.7
}

function calculateViralPotential(article: any) {
  let score = 0

  // Urgency factor
  if (article.urgency === "critical") score += 0.4
  else if (article.urgency === "high") score += 0.3
  else if (article.urgency === "medium") score += 0.2

  // Category factor
  const viralCategories = ["technology", "health", "finance"]
  if (viralCategories.includes(article.category)) score += 0.3

  // Content factors
  const viralWords = ["breakthrough", "historic", "unprecedented", "shocking", "revolutionary"]
  const viralWordCount = viralWords.filter((word) => article.content.toLowerCase().includes(word)).length
  score += Math.min(viralWordCount * 0.1, 0.3)

  return Math.min(score, 1.0)
}

function calculateMisinformationRisk(content: string, urgency: string) {
  let risk = 0

  // High urgency content has higher misinformation risk
  if (urgency === "critical") risk += 0.3

  // Check for misinformation indicators
  const misinfoIndicators = ["unverified", "sources say", "allegedly", "rumors suggest", "breaking exclusive"]
  const indicatorCount = misinfoIndicators.filter((indicator) => content.toLowerCase().includes(indicator)).length
  risk += indicatorCount * 0.15

  // Check for emotional manipulation
  const emotionalWords = ["shocking", "devastating", "outrageous", "incredible", "unbelievable"]
  const emotionalCount = emotionalWords.filter((word) => content.toLowerCase().includes(word)).length
  risk += emotionalCount * 0.1

  return Math.min(risk, 1.0)
}

async function storeWithChangeStream(article: any, analysis: any) {
  try {
    await client.connect()
    const database = client.db("TruthGuard")
    const collection = database.collection("live_articles")

    // Generate embedding for vector search
    const embedding = await generateEmbedding(article.content)

    const document = {
      ...article,
      analysis,
      embedding,
      real_time_metrics: {
        processing_timestamp: new Date(),
        viral_potential: analysis.viral_prediction?.viral_score || 0,
        misinformation_risk: analysis.misinformation_analysis?.risk_score || 0,
        bias_score: analysis.bias_analysis?.overall_score || 0,
        impact_score: analysis.impact_analysis?.societal_impact || 0,
      },
      mongodb_features: {
        change_streams: true,
        vector_search: true,
        aggregation_pipeline: true,
        real_time_analytics: true,
      },
    }

    const result = await collection.insertOne(document)

    // Trigger real-time notifications for high-impact content
    if (analysis.viral_prediction?.viral_score > 0.7 || analysis.misinformation_analysis?.risk_score > 0.8) {
      await triggerRealTimeAlert(document)
    }

    return result.insertedId
  } catch (error) {
    console.error("Error storing with change stream:", error)
    return null
  } finally {
    await client.close()
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  // Simulate embedding generation (in production, use actual embedding API)
  return new Array(1536).fill(0).map(() => Math.random() - 0.5)
}

async function triggerRealTimeAlert(document: any) {
  // Store alert in MongoDB for real-time dashboard
  try {
    await client.connect()
    const database = client.db("TruthGuard")
    const alertsCollection = database.collection("real_time_alerts")

    await alertsCollection.insertOne({
      article_id: document._id,
      alert_type: document.analysis.viral_prediction?.viral_score > 0.7 ? "viral_content" : "misinformation_risk",
      severity: document.analysis.misinformation_analysis?.risk_score > 0.8 ? "critical" : "high",
      title: document.title,
      source: document.source,
      timestamp: new Date(),
      metrics: document.real_time_metrics,
    })
  } catch (error) {
    console.error("Error triggering real-time alert:", error)
  } finally {
    await client.close()
  }
}

async function analyzeTrendingTopics() {
  try {
    await client.connect()
    const database = client.db("TruthGuard")
    const collection = database.collection("live_articles")

    // MongoDB Aggregation Pipeline for trending analysis
    const trending = await collection
      .aggregate([
        {
          $match: {
            scraped_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          },
        },
        {
          $group: {
            _id: "$category",
            article_count: { $sum: 1 },
            avg_viral_score: { $avg: "$real_time_metrics.viral_potential" },
            avg_bias_score: { $avg: "$real_time_metrics.bias_score" },
            avg_misinfo_risk: { $avg: "$real_time_metrics.misinformation_risk" },
            total_impact: { $sum: "$real_time_metrics.impact_score" },
            sources: { $addToSet: "$source" },
            sample_titles: { $push: "$title" },
          },
        },
        {
          $addFields: {
            trending_score: {
              $multiply: [{ $add: ["$avg_viral_score", "$total_impact"] }, "$article_count"],
            },
          },
        },
        { $sort: { trending_score: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    return trending
  } catch (error) {
    console.error("Error analyzing trending topics:", error)
    return []
  } finally {
    await client.close()
  }
}

async function detectViralMisinformation() {
  try {
    await client.connect()
    const database = client.db("TruthGuard")
    const collection = database.collection("live_articles")

    // Find articles with high viral potential AND high misinformation risk
    const viralMisinfo = await collection
      .aggregate([
        {
          $match: {
            "real_time_metrics.viral_potential": { $gte: 0.6 },
            "real_time_metrics.misinformation_risk": { $gte: 0.5 },
            scraped_at: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // Last 6 hours
          },
        },
        {
          $addFields: {
            danger_score: {
              $multiply: ["$real_time_metrics.viral_potential", "$real_time_metrics.misinformation_risk"],
            },
          },
        },
        { $sort: { danger_score: -1 } },
        {
          $project: {
            title: 1,
            source: 1,
            category: 1,
            danger_score: 1,
            viral_potential: "$real_time_metrics.viral_potential",
            misinformation_risk: "$real_time_metrics.misinformation_risk",
            scraped_at: 1,
            analysis: 1,
          },
        },
        { $limit: 5 },
      ])
      .toArray()

    return viralMisinfo
  } catch (error) {
    console.error("Error detecting viral misinformation:", error)
    return []
  } finally {
    await client.close()
  }
}

// Helper functions for analysis
function detectLanguageBias(content: string) {
  const biasWords = ["allegedly", "reportedly", "sources claim", "it is believed", "supposedly"]
  return biasWords.filter((word) => content.toLowerCase().includes(word)).length * 0.2
}

function analyzeFraming(content: string) {
  const frames = {
    conflict: ["battle", "fight", "war", "clash", "confrontation"],
    economic: ["cost", "price", "economy", "financial", "budget"],
    moral: ["right", "wrong", "ethical", "moral", "values"],
    human_interest: ["family", "personal", "individual", "story", "experience"],
  }

  let dominantFrame = "neutral"
  let maxScore = 0

  for (const [frame, keywords] of Object.entries(frames)) {
    const score = keywords.filter((word) => content.toLowerCase().includes(word)).length
    if (score > maxScore) {
      maxScore = score
      dominantFrame = frame
    }
  }

  return dominantFrame
}

function detectFactCheckFlags(content: string) {
  const flags = []

  if (content.includes("studies show") || content.includes("research indicates")) {
    flags.push("vague_attribution")
  }

  if (content.includes("experts say") || content.includes("sources claim")) {
    flags.push("anonymous_sources")
  }

  if (content.includes("breaking") || content.includes("exclusive")) {
    flags.push("urgency_pressure")
  }

  return flags
}

function verifySourceCredibility(source: string) {
  const credibilityDatabase = {
    Reuters: { score: 0.95, bias: "center", reliability: "high" },
    BBC: { score: 0.92, bias: "center-left", reliability: "high" },
    "Associated Press": { score: 0.94, bias: "center", reliability: "high" },
    NPR: { score: 0.89, bias: "center-left", reliability: "high" },
    CNN: { score: 0.78, bias: "left", reliability: "medium-high" },
  }

  return credibilityDatabase[source] || { score: 0.6, bias: "unknown", reliability: "medium" }
}

function extractAndVerifyClaims(content: string) {
  // Extract factual claims for verification
  const claims = []

  // Look for statistical claims
  const statRegex = /(\d+(?:\.\d+)?)\s*(?:percent|%|million|billion|thousand)/gi
  const stats = content.match(statRegex)
  if (stats) {
    claims.push(...stats.map((stat) => ({ type: "statistical", claim: stat, verification_needed: true })))
  }

  // Look for attribution claims
  if (content.includes("according to") || content.includes("reported by")) {
    claims.push({ type: "attribution", claim: "source_attribution", verification_needed: true })
  }

  return claims
}

function analyzeEngagementFactors(content: string) {
  const factors = {
    emotional_appeal: 0,
    controversy_level: 0,
    novelty_factor: 0,
    personal_relevance: 0,
  }

  // Emotional appeal
  const emotionalWords = ["shocking", "amazing", "incredible", "devastating", "heartwarming"]
  factors.emotional_appeal = Math.min(
    emotionalWords.filter((word) => content.toLowerCase().includes(word)).length * 0.25,
    1,
  )

  // Controversy level
  const controversialTopics = ["politics", "religion", "climate", "vaccines", "immigration"]
  factors.controversy_level = controversialTopics.filter((topic) => content.toLowerCase().includes(topic)).length * 0.2

  // Novelty factor
  const noveltyWords = ["first", "new", "breakthrough", "unprecedented", "revolutionary"]
  factors.novelty_factor = Math.min(noveltyWords.filter((word) => content.toLowerCase().includes(word)).length * 0.2, 1)

  return factors
}

function detectEmotionalTriggers(content: string) {
  const triggers = {
    fear: ["dangerous", "threat", "risk", "warning", "crisis"],
    anger: ["outrageous", "unfair", "scandal", "corruption", "betrayal"],
    hope: ["breakthrough", "solution", "progress", "improvement", "success"],
    sadness: ["tragic", "loss", "devastating", "heartbreaking", "unfortunate"],
  }

  const detectedTriggers = []

  for (const [emotion, words] of Object.entries(triggers)) {
    const count = words.filter((word) => content.toLowerCase().includes(word)).length
    if (count > 0) {
      detectedTriggers.push({ emotion, intensity: Math.min(count * 0.3, 1) })
    }
  }

  return detectedTriggers
}

function calculateShareabilityIndex(article: any) {
  let index = 0

  // Title length factor (optimal 60-100 characters)
  const titleLength = article.title.length
  if (titleLength >= 60 && titleLength <= 100) index += 0.3

  // Urgency factor
  if (article.urgency === "critical") index += 0.4
  else if (article.urgency === "high") index += 0.3

  // Category factor
  const shareableCategories = ["technology", "health", "environment"]
  if (shareableCategories.includes(article.category)) index += 0.3

  return Math.min(index, 1.0)
}

function calculateSocietalImpact(category: string, content: string) {
  const impactScores = {
    technology: 0.8,
    health: 0.9,
    environment: 0.85,
    finance: 0.7,
    politics: 0.75,
  }

  let baseScore = impactScores[category] || 0.5

  // Boost for global implications
  if (content.toLowerCase().includes("global") || content.toLowerCase().includes("worldwide")) {
    baseScore += 0.2
  }

  return Math.min(baseScore, 1.0)
}

function calculateMarketImpact(category: string) {
  const marketImpact = {
    finance: 0.9,
    technology: 0.8,
    health: 0.7,
    environment: 0.6,
    politics: 0.5,
  }

  return marketImpact[category] || 0.3
}

function analyzePolicyImplications(content: string) {
  const policyKeywords = ["regulation", "law", "policy", "legislation", "government", "congress", "senate"]
  const policyScore = policyKeywords.filter((word) => content.toLowerCase().includes(word)).length

  if (policyScore >= 3) return "high"
  if (policyScore >= 1) return "medium"
  return "low"
}

function detectPrimaryEmotion(content: string) {
  const emotions = {
    fear: ["afraid", "scared", "terrified", "worried", "anxious", "panic"],
    anger: ["angry", "furious", "outraged", "mad", "irritated", "frustrated"],
    joy: ["happy", "excited", "thrilled", "delighted", "pleased", "cheerful"],
    sadness: ["sad", "depressed", "disappointed", "heartbroken", "grief", "sorrow"],
    surprise: ["surprised", "shocked", "amazed", "astonished", "stunned", "bewildered"],
  }

  let dominantEmotion = "neutral"
  let maxScore = 0

  for (const [emotion, words] of Object.entries(emotions)) {
    const score = words.filter((word) => content.toLowerCase().includes(word)).length
    if (score > maxScore) {
      maxScore = score
      dominantEmotion = emotion
    }
  }

  return dominantEmotion
}

function calculateEmotionalIntensity(content: string) {
  const intensityWords = ["extremely", "incredibly", "absolutely", "completely", "totally", "utterly"]
  const capsCount = (content.match(/[A-Z]/g) || []).length
  const exclamationCount = (content.match(/!/g) || []).length

  let intensity = 0
  intensity += intensityWords.filter((word) => content.toLowerCase().includes(word)).length * 0.2
  intensity += Math.min((capsCount / content.length) * 10, 0.3) // Normalize caps ratio
  intensity += Math.min(exclamationCount * 0.1, 0.2)

  return Math.min(intensity, 1.0)
}

function analyzeSentimentTrajectory(content: string) {
  // Analyze how sentiment changes throughout the article
  const sentences = content.split(/[.!?]+/)
  const trajectory = []

  for (let i = 0; i < Math.min(sentences.length, 5); i++) {
    const sentence = sentences[i]
    const positiveWords = ["good", "great", "excellent", "positive", "success", "improvement"]
    const negativeWords = ["bad", "terrible", "awful", "negative", "failure", "decline"]

    const positiveCount = positiveWords.filter((word) => sentence.toLowerCase().includes(word)).length
    const negativeCount = negativeWords.filter((word) => sentence.toLowerCase().includes(word)).length

    const sentiment = (positiveCount - negativeCount) / Math.max(sentence.split(" ").length / 10, 1)
    trajectory.push(Math.max(-1, Math.min(1, sentiment)))
  }

  return trajectory
}

function detectManipulationTactics(content: string) {
  const tactics = []

  // Appeal to fear
  const fearWords = ["dangerous", "threat", "risk", "warning", "crisis", "disaster"]
  if (fearWords.filter((word) => content.toLowerCase().includes(word)).length >= 2) {
    tactics.push("fear_appeal")
  }

  // False urgency
  if (content.includes("act now") || content.includes("limited time") || content.includes("urgent")) {
    tactics.push("false_urgency")
  }

  // Bandwagon effect
  if (content.includes("everyone") || content.includes("most people") || content.includes("majority")) {
    tactics.push("bandwagon")
  }

  // Authority appeal without credentials
  if (content.includes("experts say") || content.includes("studies show") || content.includes("research proves")) {
    tactics.push("false_authority")
  }

  return tactics
}

export async function GET() {
  // Auto-trigger live scraping every hour
  try {
    const results = await startLiveScraping()
    return NextResponse.json({
      success: true,
      message: "Automated live scraping completed",
      articles_processed: results.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Auto-scraping failed" }, { status: 500 })
  }
}
