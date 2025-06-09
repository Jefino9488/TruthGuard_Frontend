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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get("timeframe") || "24h"
    const threshold = Number.parseFloat(searchParams.get("threshold") || "0.6")

    await client.connect()
    const database = client.db("TruthGuard")
    const collection = database.collection("live_articles")

    // Calculate time range
    const timeRanges = {
      "1h": 1 * 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    }

    const timeRange = timeRanges[timeframe] || timeRanges["24h"]
    const startTime = new Date(Date.now() - timeRange)

    // Advanced MongoDB aggregation for viral content tracking
    const viralContent = await collection
      .aggregate([
        {
          $match: {
            scraped_at: { $gte: startTime },
            "real_time_metrics.viral_potential": { $gte: threshold },
          },
        },
        {
          $addFields: {
            viral_danger_score: {
              $multiply: [
                "$real_time_metrics.viral_potential",
                { $add: ["$real_time_metrics.misinformation_risk", 0.1] },
              ],
            },
            engagement_prediction: {
              $multiply: [
                "$real_time_metrics.viral_potential",
                {
                  $cond: [{ $eq: ["$urgency", "critical"] }, 1.5, { $cond: [{ $eq: ["$urgency", "high"] }, 1.2, 1.0] }],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "real_time_alerts",
            localField: "_id",
            foreignField: "article_id",
            as: "alerts",
          },
        },
        {
          $addFields: {
            alert_count: { $size: "$alerts" },
            has_misinformation_alert: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$alerts",
                      cond: { $eq: ["$$this.alert_type", "misinformation_risk"] },
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $facet: {
            viral_articles: [
              { $sort: { viral_danger_score: -1 } },
              { $limit: 10 },
              {
                $project: {
                  title: 1,
                  source: 1,
                  category: 1,
                  urgency: 1,
                  viral_potential: "$real_time_metrics.viral_potential",
                  misinformation_risk: "$real_time_metrics.misinformation_risk",
                  viral_danger_score: 1,
                  engagement_prediction: 1,
                  scraped_at: 1,
                  has_misinformation_alert: 1,
                  alert_count: 1,
                  analysis: {
                    political_spectrum: "$analysis.bias_analysis.political_spectrum",
                    primary_emotion: "$analysis.emotion_analysis.primary_emotion",
                    emotional_triggers: "$analysis.emotion_analysis.emotional_triggers",
                  },
                },
              },
            ],
            viral_trends: [
              {
                $group: {
                  _id: {
                    category: "$category",
                    hour: { $hour: "$scraped_at" },
                  },
                  viral_count: { $sum: 1 },
                  avg_viral_score: { $avg: "$real_time_metrics.viral_potential" },
                  avg_misinfo_risk: { $avg: "$real_time_metrics.misinformation_risk" },
                  max_danger_score: { $max: "$viral_danger_score" },
                },
              },
              { $sort: { "_id.hour": -1 } },
            ],
            source_analysis: [
              {
                $group: {
                  _id: "$source",
                  viral_articles: { $sum: 1 },
                  avg_viral_potential: { $avg: "$real_time_metrics.viral_potential" },
                  avg_misinformation_risk: { $avg: "$real_time_metrics.misinformation_risk" },
                  categories: { $addToSet: "$category" },
                  total_danger_score: { $sum: "$viral_danger_score" },
                },
              },
              { $sort: { total_danger_score: -1 } },
            ],
            emotion_patterns: [
              {
                $group: {
                  _id: "$analysis.emotion_analysis.primary_emotion",
                  count: { $sum: 1 },
                  avg_viral_score: { $avg: "$real_time_metrics.viral_potential" },
                  categories: { $addToSet: "$category" },
                },
              },
              { $sort: { avg_viral_score: -1 } },
            ],
          },
        },
      ])
      .toArray()

    // Real-time viral prediction using machine learning-like scoring
    const viralPredictions = await generateViralPredictions(collection, startTime)

    // Misinformation spread analysis
    const misinfoSpread = await analyzeMisinformationSpread(collection, startTime)

    return NextResponse.json({
      success: true,
      timeframe,
      threshold,
      viral_content: viralContent[0],
      viral_predictions: viralPredictions,
      misinformation_spread: misinfoSpread,
      generated_at: new Date().toISOString(),
      mongodb_features: [
        "Advanced Aggregation Pipeline",
        "Faceted Search",
        "Lookup Operations",
        "Time-based Analysis",
        "Real-time Scoring",
      ],
    })
  } catch (error) {
    console.error("Viral tracker error:", error)
    return NextResponse.json({ error: "Viral tracking failed" }, { status: 500 })
  } finally {
    await client.close()
  }
}

async function generateViralPredictions(collection: any, startTime: Date) {
  // Predict which content will go viral in the next 6 hours
  const predictions = await collection
    .aggregate([
      {
        $match: {
          scraped_at: { $gte: startTime },
          "real_time_metrics.viral_potential": { $gte: 0.4 },
        },
      },
      {
        $addFields: {
          prediction_score: {
            $multiply: [
              "$real_time_metrics.viral_potential",
              {
                $switch: {
                  branches: [
                    { case: { $eq: ["$category", "technology"] }, then: 1.3 },
                    { case: { $eq: ["$category", "health"] }, then: 1.2 },
                    { case: { $eq: ["$category", "environment"] }, then: 1.1 },
                    { case: { $eq: ["$category", "finance"] }, then: 1.0 },
                  ],
                  default: 0.9,
                },
              },
              {
                $cond: [{ $gte: ["$analysis.emotion_analysis.emotional_intensity", 0.7] }, 1.4, 1.0],
              },
            ],
          },
          time_decay_factor: {
            $subtract: [
              1,
              {
                $divide: [
                  { $subtract: [new Date(), "$scraped_at"] },
                  6 * 60 * 60 * 1000, // 6 hours in milliseconds
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          final_prediction: {
            $multiply: ["$prediction_score", "$time_decay_factor"],
          },
        },
      },
      { $sort: { final_prediction: -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          source: 1,
          category: 1,
          prediction_score: 1,
          final_prediction: 1,
          viral_potential: "$real_time_metrics.viral_potential",
          emotional_intensity: "$analysis.emotion_analysis.emotional_intensity",
          predicted_peak_time: {
            $add: ["$scraped_at", 4 * 60 * 60 * 1000], // Predict peak in 4 hours
          },
        },
      },
    ])
    .toArray()

  return predictions
}

async function analyzeMisinformationSpread(collection: any, startTime: Date) {
  // Analyze how misinformation spreads across sources and topics
  const spread = await collection
    .aggregate([
      {
        $match: {
          scraped_at: { $gte: startTime },
          "real_time_metrics.misinformation_risk": { $gte: 0.5 },
        },
      },
      {
        $facet: {
          by_source: [
            {
              $group: {
                _id: "$source",
                misinfo_articles: { $sum: 1 },
                avg_risk: { $avg: "$real_time_metrics.misinformation_risk" },
                avg_viral_potential: { $avg: "$real_time_metrics.viral_potential" },
                topics: { $addToSet: "$category" },
                danger_articles: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$real_time_metrics.misinformation_risk", 0.7] },
                          { $gte: ["$real_time_metrics.viral_potential", 0.6] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { danger_articles: -1 } },
          ],
          by_topic: [
            {
              $group: {
                _id: "$category",
                misinfo_count: { $sum: 1 },
                avg_risk: { $avg: "$real_time_metrics.misinformation_risk" },
                sources_involved: { $addToSet: "$source" },
                viral_misinfo_count: {
                  $sum: {
                    $cond: [{ $gte: ["$real_time_metrics.viral_potential", 0.6] }, 1, 0],
                  },
                },
              },
            },
            { $sort: { viral_misinfo_count: -1 } },
          ],
          temporal_spread: [
            {
              $group: {
                _id: {
                  hour: { $hour: "$scraped_at" },
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$scraped_at" } },
                },
                misinfo_count: { $sum: 1 },
                avg_risk: { $avg: "$real_time_metrics.misinformation_risk" },
                viral_misinfo: {
                  $sum: {
                    $cond: [{ $gte: ["$real_time_metrics.viral_potential", 0.6] }, 1, 0],
                  },
                },
              },
            },
            { $sort: { "_id.date": -1, "_id.hour": -1 } },
          ],
          cross_source_patterns: [
            {
              $group: {
                _id: {
                  category: "$category",
                  political_spectrum: "$analysis.bias_analysis.political_spectrum",
                },
                count: { $sum: 1 },
                sources: { $addToSet: "$source" },
                avg_misinfo_risk: { $avg: "$real_time_metrics.misinformation_risk" },
                common_claims: { $addToSet: "$analysis.misinformation_analysis.claim_verification" },
              },
            },
            { $match: { count: { $gte: 2 } } }, // Only patterns with multiple articles
            { $sort: { avg_misinfo_risk: -1 } },
          ],
        },
      },
    ])
    .toArray()

  return spread[0]
}

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json()

    if (action === "track_specific_content") {
      return await trackSpecificContent(params)
    }

    if (action === "predict_viral_cascade") {
      return await predictViralCascade(params)
    }

    if (action === "analyze_manipulation_tactics") {
      return await analyzeManipulationTactics(params)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Viral tracker POST error:", error)
    return NextResponse.json({ error: "Request failed" }, { status: 500 })
  }
}

async function trackSpecificContent(params: any) {
  try {
    await client.connect()
    const database = client.db("TruthGuard")
    const collection = database.collection("live_articles")

    const { content_id, tracking_duration = 24 } = params

    // Track specific content's viral progression
    const tracking = await collection
      .aggregate([
        { $match: { _id: content_id } },
        {
          $lookup: {
            from: "viral_tracking_history",
            localField: "_id",
            foreignField: "content_id",
            as: "tracking_history",
          },
        },
        {
          $addFields: {
            viral_progression: {
              $map: {
                input: "$tracking_history",
                as: "track",
                in: {
                  timestamp: "$$track.timestamp",
                  viral_score: "$$track.viral_score",
                  engagement_metrics: "$$track.engagement_metrics",
                },
              },
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      tracking_data: tracking[0],
      prediction: {
        peak_viral_time: new Date(Date.now() + 6 * 60 * 60 * 1000),
        expected_reach: calculateExpectedReach(tracking[0]),
        risk_assessment: assessViralRisk(tracking[0]),
      },
    })
  } catch (error) {
    console.error("Content tracking error:", error)
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 })
  } finally {
    await client.close()
  }
}

async function predictViralCascade(params: any) {
  try {
    await client.connect()
    const database = client.db("TruthGuard")
    const collection = database.collection("live_articles")

    const { topic, timeframe = "6h" } = params

    // Predict viral cascade for a specific topic
    const cascade = await collection
      .aggregate([
        {
          $match: {
            category: topic,
            scraped_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        },
        {
          $addFields: {
            cascade_potential: {
              $multiply: [
                "$real_time_metrics.viral_potential",
                "$real_time_metrics.impact_score",
                {
                  $cond: [{ $gte: ["$analysis.emotion_analysis.emotional_intensity", 0.7] }, 1.5, 1.0],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            total_cascade_potential: { $sum: "$cascade_potential" },
            article_count: { $sum: 1 },
            avg_viral_potential: { $avg: "$real_time_metrics.viral_potential" },
            sources_involved: { $addToSet: "$source" },
            emotional_triggers: { $push: "$analysis.emotion_analysis.emotional_triggers" },
          },
        },
        {
          $addFields: {
            cascade_probability: {
              $cond: [
                { $gte: ["$total_cascade_potential", 5.0] },
                "high",
                { $cond: [{ $gte: ["$total_cascade_potential", 2.0] }, "medium", "low"] },
              ],
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      topic,
      cascade_prediction: cascade[0],
      timeline_prediction: generateTimelinePrediction(cascade[0]),
      mitigation_strategies: generateMitigationStrategies(cascade[0]),
    })
  } catch (error) {
    console.error("Cascade prediction error:", error)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  } finally {
    await client.close()
  }
}

async function analyzeManipulationTactics(params: any) {
  try {
    await client.connect()
    const database = client.db("TruthGuard")
    const collection = database.collection("live_articles")

    const { timeframe = "24h" } = params

    const timeRange =
      {
        "1h": 1 * 60 * 60 * 1000,
        "6h": 6 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
      }[timeframe] || 24 * 60 * 60 * 1000

    // Analyze manipulation tactics across content
    const tactics = await collection
      .aggregate([
        {
          $match: {
            scraped_at: { $gte: new Date(Date.now() - timeRange) },
            "analysis.emotion_analysis.manipulation_indicators": { $exists: true, $ne: [] },
          },
        },
        {
          $unwind: "$analysis.emotion_analysis.manipulation_indicators",
        },
        {
          $group: {
            _id: "$analysis.emotion_analysis.manipulation_indicators",
            frequency: { $sum: 1 },
            sources_using: { $addToSet: "$source" },
            categories_affected: { $addToSet: "$category" },
            avg_viral_potential: { $avg: "$real_time_metrics.viral_potential" },
            avg_misinfo_risk: { $avg: "$real_time_metrics.misinformation_risk" },
            sample_titles: { $push: "$title" },
          },
        },
        { $sort: { frequency: -1 } },
        {
          $addFields: {
            manipulation_severity: {
              $switch: {
                branches: [
                  { case: { $gte: ["$avg_misinfo_risk", 0.8] }, then: "critical" },
                  { case: { $gte: ["$avg_misinfo_risk", 0.6] }, then: "high" },
                  { case: { $gte: ["$avg_misinfo_risk", 0.4] }, then: "medium" },
                ],
                default: "low",
              },
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      timeframe,
      manipulation_analysis: tactics,
      summary: {
        total_tactics_detected: tactics.length,
        most_common_tactic: tactics[0]?._id || "none",
        highest_risk_tactic: tactics.find((t) => t.manipulation_severity === "critical")?._id || "none",
        sources_most_manipulative: getMostManipulativeSources(tactics),
      },
      recommendations: generateManipulationCountermeasures(tactics),
    })
  } catch (error) {
    console.error("Manipulation analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  } finally {
    await client.close()
  }
}

// Helper functions
function calculateExpectedReach(trackingData: any) {
  const baseReach = trackingData?.real_time_metrics?.viral_potential * 100000 || 1000
  const sourceMultiplier = getSourceReachMultiplier(trackingData?.source)
  const categoryMultiplier = getCategoryReachMultiplier(trackingData?.category)

  return Math.round(baseReach * sourceMultiplier * categoryMultiplier)
}

function assessViralRisk(trackingData: any) {
  const viralPotential = trackingData?.real_time_metrics?.viral_potential || 0
  const misinfoRisk = trackingData?.real_time_metrics?.misinformation_risk || 0

  const combinedRisk = viralPotential * 0.6 + misinfoRisk * 0.4

  if (combinedRisk >= 0.8) return "critical"
  if (combinedRisk >= 0.6) return "high"
  if (combinedRisk >= 0.4) return "medium"
  return "low"
}

function getSourceReachMultiplier(source: string) {
  const multipliers = {
    CNN: 2.5,
    BBC: 2.2,
    Reuters: 1.8,
    NPR: 1.5,
    "Associated Press": 1.7,
  }
  return multipliers[source] || 1.0
}

function getCategoryReachMultiplier(category: string) {
  const multipliers = {
    technology: 1.8,
    health: 2.0,
    politics: 1.6,
    environment: 1.4,
    finance: 1.2,
  }
  return multipliers[category] || 1.0
}

function generateTimelinePrediction(cascadeData: any) {
  const probability = cascadeData?.cascade_probability || "low"

  const timelines = {
    high: {
      initial_spread: "1-2 hours",
      peak_engagement: "4-6 hours",
      plateau_phase: "12-24 hours",
      decline_phase: "24-48 hours",
    },
    medium: {
      initial_spread: "2-4 hours",
      peak_engagement: "8-12 hours",
      plateau_phase: "24-48 hours",
      decline_phase: "48-72 hours",
    },
    low: {
      initial_spread: "4-8 hours",
      peak_engagement: "12-24 hours",
      plateau_phase: "48-72 hours",
      decline_phase: "72+ hours",
    },
  }

  return timelines[probability] || timelines["low"]
}

function generateMitigationStrategies(cascadeData: any) {
  const strategies = []

  if (cascadeData?.cascade_probability === "high") {
    strategies.push("Immediate fact-checking deployment")
    strategies.push("Counter-narrative preparation")
    strategies.push("Source verification alerts")
  }

  if (cascadeData?.avg_viral_potential > 0.7) {
    strategies.push("Social media monitoring activation")
    strategies.push("Expert commentary preparation")
  }

  strategies.push("Real-time tracking implementation")
  strategies.push("Cross-platform monitoring")

  return strategies
}

function getMostManipulativeSources(tactics: any[]) {
  const sourceFrequency = {}

  tactics.forEach((tactic) => {
    tactic.sources_using.forEach((source) => {
      sourceFrequency[source] = (sourceFrequency[source] || 0) + tactic.frequency
    })
  })

  return Object.entries(sourceFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([source, count]) => ({ source, manipulation_count: count }))
}

function generateManipulationCountermeasures(tactics: any[]) {
  const countermeasures = []

  const criticalTactics = tactics.filter((t) => t.manipulation_severity === "critical")
  if (criticalTactics.length > 0) {
    countermeasures.push("Deploy immediate fact-checking for critical manipulation tactics")
    countermeasures.push("Alert users to high-risk content patterns")
  }

  const commonTactics = tactics.slice(0, 3).map((t) => t._id)
  countermeasures.push(`Focus detection on common tactics: ${commonTactics.join(", ")}`)

  countermeasures.push("Implement source credibility warnings")
  countermeasures.push("Provide alternative perspective suggestions")

  return countermeasures
}
