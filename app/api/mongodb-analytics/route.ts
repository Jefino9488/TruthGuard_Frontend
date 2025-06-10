import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGODB_URI as string
const dbName = process.env.MONGODB_DB as string

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export async function GET(request: NextRequest) {
  try {
    await client.connect()
    const database = client.db(dbName)
    const collection = database.collection("articles")

    const searchParams = request.nextUrl.searchParams
    const analysisType = searchParams.get("type") || "overview"

    let result

    switch (analysisType) {
      case "bias_trends":
        result = await getBiasTrends(collection)
        break
      case "source_comparison":
        result = await getSourceComparison(collection)
        break
      case "topic_analysis":
        result = await getTopicAnalysis(collection)
        break
      case "misinformation_patterns":
        result = await getMisinformationPatterns(collection)
        break
      case "real_time_stats":
        result = await getRealTimeStats(collection)
        break
      default:
        result = await getOverviewAnalytics(collection)
    }

    return NextResponse.json({
      success: true,
      data: result,
      analysisType,
      generatedAt: new Date().toISOString(),
      mongodbFeatures: [
        "Advanced Aggregation Pipeline",
        "Time Series Analysis",
        "Statistical Operations",
        "Faceted Search",
        "Real-time Analytics",
      ],
    })
  } catch (error) {
    console.error("MongoDB Analytics Error:", error)
    return NextResponse.json({ success: false, error: "Analytics failed" }, { status: 500 })
  } finally {
    await client.close()
  }
}


async function getBiasTrends(collection: any) {
  return await collection
    .aggregate([
      {
        $addFields: {
          dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        },
      },
      {
        $group: {
          _id: "$dateStr",
          avgBias: { $avg: "$bias_score" },
          articleCount: { $sum: 1 },
          highBiasCount: {
            $sum: { $cond: [{ $gte: ["$bias_score", 0.6] }, 1, 0] },
          },
          sources: { $addToSet: "$source" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ])
    .toArray()
}

async function getSourceComparison(collection: any) {
  return await collection
    .aggregate([
      {
        $group: {
          _id: "$source",
          articleCount: { $sum: 1 },
          avgBias: { $avg: "$bias_score" },
          avgCredibility: { $avg: "$credibility_score" },
          avgMisinfoRisk: { $avg: "$misinformation_risk" },
          avgSentiment: { $avg: "$sentiment" },
          topics: { $addToSet: "$topic" },
          biasDistribution: {
            $push: {
              $switch: {
                branches: [
                  { case: { $lt: ["$bias_score", 0.3] }, then: "low" },
                  { case: { $lt: ["$bias_score", 0.6] }, then: "moderate" },
                  { case: { $gte: ["$bias_score", 0.6] }, then: "high" },
                ],
                default: "unknown",
              },
            },
          },
        },
      },
      {
        $addFields: {
          biasCategories: {
            $reduce: {
              input: "$biasDistribution",
              initialValue: { low: 0, moderate: 0, high: 0 },
              in: {
                low: { $cond: [{ $eq: ["$$this", "low"] }, { $add: ["$$value.low", 1] }, "$$value.low"] },
                moderate: {
                  $cond: [{ $eq: ["$$this", "moderate"] }, { $add: ["$$value.moderate", 1] }, "$$value.moderate"],
                },
                high: { $cond: [{ $eq: ["$$this", "high"] }, { $add: ["$$value.high", 1] }, "$$value.high"] },
              },
            },
          },
        },
      },
      { $sort: { articleCount: -1 } },
    ])
    .toArray()
}

async function getTopicAnalysis(collection: any) {
  return await collection
    .aggregate([
      {
        $group: {
          _id: "$topic",
          count: { $sum: 1 },
          avgBias: { $avg: "$bias_score" },
          avgCredibility: { $avg: "$credibility_score" },
          avgSentiment: { $avg: "$sentiment" },
          avgMisinfoRisk: { $avg: "$misinformation_risk" },
          sources: { $addToSet: "$source" },
          recentTrend: {
            $push: {
              $cond: [
                { $gte: ["$timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                  bias: "$bias_score",
                  sentiment: "$sentiment",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },
      {
        $addFields: {
          trendDirection: {
            $cond: [
              { $gt: [{ $size: "$recentTrend" }, 1] },
              {
                $cond: [
                  {
                    $gt: [
                      { $avg: { $slice: ["$recentTrend.bias", -3] } },
                      { $avg: { $slice: ["$recentTrend.bias", 0, 3] } },
                    ],
                  },
                  "increasing",
                  "decreasing",
                ],
              },
              "stable",
            ],
          },
        },
      },
      { $sort: { count: -1 } },
    ])
    .toArray()
}

async function getMisinformationPatterns(collection: any) {
  return await collection
    .aggregate([
      {
        $match: {
          misinformation_risk: { $gte: 0.5 },
        },
      },
      {
        $facet: {
          riskBySource: [
            {
              $group: {
                _id: "$source",
                highRiskCount: { $sum: 1 },
                avgRisk: { $avg: "$misinformation_risk" },
                totalArticles: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: "articles",
                let: { source: "$_id" },
                pipeline: [{ $match: { $expr: { $eq: ["$source", "$$source"] } } }, { $count: "total" }],
                as: "totalCount",
              },
            },
            {
              $addFields: {
                riskPercentage: {
                  $multiply: [{ $divide: ["$highRiskCount", { $arrayElemAt: ["$totalCount.total", 0] }] }, 100],
                },
              },
            },
          ],
          riskByTopic: [
            {
              $group: {
                _id: "$topic",
                highRiskCount: { $sum: 1 },
                avgRisk: { $avg: "$misinformation_risk" },
                commonPatterns: { $addToSet: "$narrative_analysis.primary_frame" },
              },
            },
          ],
          timePatterns: [
            {
              $group: {
                _id: {
                  hour: { $hour: "$timestamp" },
                  dayOfWeek: { $dayOfWeek: "$timestamp" },
                },
                riskCount: { $sum: 1 },
                avgRisk: { $avg: "$misinformation_risk" },
              },
            },
          ],
        },
      },
    ])
    .toArray()
}

async function getRealTimeStats(collection: any) {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  return await collection
    .aggregate([
      {
        $facet: {
          lastHour: [
            { $match: { timestamp: { $gte: oneHourAgo } } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                avgBias: { $avg: "$bias_score" },
                highRiskCount: {
                  $sum: { $cond: [{ $gte: ["$misinformation_risk", 0.7] }, 1, 0] },
                },
              },
            },
          ],
          last24Hours: [
            { $match: { timestamp: { $gte: oneDayAgo } } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                avgBias: { $avg: "$bias_score" },
                avgCredibility: { $avg: "$credibility_score" },
                sources: { $addToSet: "$source" },
                topics: { $addToSet: "$topic" },
              },
            },
          ],
          processingRate: [
            { $match: { timestamp: { $gte: oneHourAgo } } },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d %H:00",
                    date: "$timestamp",
                  },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ])
    .toArray()
}

async function getOverviewAnalytics(collection: any) {
  return await collection
    .aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalArticles: { $sum: 1 },
                avgBias: { $avg: "$bias_score" },
                avgCredibility: { $avg: "$credibility_score" },
                avgMisinfoRisk: { $avg: "$misinformation_risk" },
                uniqueSources: { $addToSet: "$source" },
                uniqueTopics: { $addToSet: "$topic" },
              },
            },
          ],
          biasDistribution: [
            {
              $bucket: {
                groupBy: "$bias_score",
                boundaries: [0, 0.3, 0.6, 1.0],
                default: "other",
                output: {
                  count: { $sum: 1 },
                  avgCredibility: { $avg: "$credibility_score" },
                },
              },
            },
          ],
          recentActivity: [
            { $sort: { timestamp: -1 } },
            { $limit: 10 },
            {
              $project: {
                title: 1,
                source: 1,
                bias_score: 1,
                timestamp: 1,
                topic: 1,
              },
            },
          ],
        },
      },
    ])
    .toArray()
}
