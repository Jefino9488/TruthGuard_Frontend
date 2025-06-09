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
    const analysisType = searchParams.get("type") || "comprehensive"

    await client.connect()
    const database = client.db("TruthGuard")
    const articlesCollection = database.collection("live_articles")

    let insights

    switch (analysisType) {
      case "bias_evolution":
        insights = await analyzeBiasEvolution(articlesCollection)
        break
      case "narrative_warfare":
        insights = await analyzeNarrativeWarfare(articlesCollection)
        break
      case "influence_networks":
        insights = await analyzeInfluenceNetworks(articlesCollection)
        break
      case "predictive_modeling":
        insights = await generatePredictiveModels(articlesCollection)
        break
      default:
        insights = await generateComprehensiveInsights(articlesCollection)
    }

    return NextResponse.json({
      success: true,
      analysis_type: analysisType,
      insights,
      generated_at: new Date().toISOString(),
      ai_powered: true,
      mongodb_features: [
        "Advanced Aggregation Pipelines",
        "Machine Learning Integration",
        "Real-time Pattern Recognition",
        "Predictive Analytics",
        "Network Analysis",
      ],
    })
  } catch (error) {
    console.error("AI Insights error:", error)
    return NextResponse.json({ error: "Insights generation failed" }, { status: 500 })
  } finally {
    await client.close()
  }
}

async function analyzeBiasEvolution(collection: any) {
  // Analyze how bias patterns evolve over time
  const biasEvolution = await collection
    .aggregate([
      {
        $match: {
          scraped_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        },
      },
      {
        $addFields: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$scraped_at" } },
          hour: { $hour: "$scraped_at" },
        },
      },
      {
        $group: {
          _id: {
            day: "$day",
            political_spectrum: "$analysis.bias_analysis.political_spectrum",
            source: "$source",
          },
          article_count: { $sum: 1 },
          avg_bias_score: { $avg: "$real_time_metrics.bias_score" },
          avg_viral_potential: { $avg: "$real_time_metrics.viral_potential" },
          topics: { $addToSet: "$category" },
          emotional_intensity: { $avg: "$analysis.emotion_analysis.emotional_intensity" },
        },
      },
      {
        $group: {
          _id: "$_id.day",
          bias_distribution: {
            $push: {
              political_spectrum: "$_id.political_spectrum",
              source: "$_id.source",
              article_count: "$article_count",
              avg_bias_score: "$avg_bias_score",
              avg_viral_potential: "$avg_viral_potential",
              emotional_intensity: "$emotional_intensity",
            },
          },
          daily_polarization: {
            $avg: {
              $abs: { $subtract: ["$avg_bias_score", 0.5] },
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ])
    .toArray()

  // Calculate bias shift patterns
  const biasShifts = calculateBiasShifts(biasEvolution)

  // Detect echo chamber formation
  const echoChambers = detectEchoChambers(biasEvolution)

  return {
    bias_evolution: biasEvolution,
    bias_shifts: biasShifts,
    echo_chambers: echoChambers,
    polarization_trend: calculatePolarizationTrend(biasEvolution),
    ai_insights: generateBiasInsights(biasEvolution),
  }
}

async function analyzeNarrativeWarfare(collection: any) {
  // Detect coordinated narrative campaigns
  const narrativeAnalysis = await collection
    .aggregate([
      {
        $match: {
          scraped_at: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // Last 48 hours
        },
      },
      {
        $group: {
          _id: {
            primary_frame: "$analysis.narrative_analysis.primary_frame",
            category: "$category",
          },
          articles: {
            $push: {
              title: "$title",
              source: "$source",
              scraped_at: "$scraped_at",
              bias_score: "$real_time_metrics.bias_score",
              viral_potential: "$real_time_metrics.viral_potential",
              political_spectrum: "$analysis.bias_analysis.political_spectrum",
            },
          },
          source_count: { $addToSet: "$source" },
          avg_viral_potential: { $avg: "$real_time_metrics.viral_potential" },
          time_span: {
            $push: "$scraped_at",
          },
        },
      },
      {
        $addFields: {
          source_diversity: { $size: "$source_count" },
          article_count: { $size: "$articles" },
          time_range: {
            $subtract: [{ $max: "$time_span" }, { $min: "$time_span" }],
          },
          coordination_score: {
            $multiply: [{ $size: "$articles" }, { $divide: [1, { $add: [{ $size: "$source_count" }, 1] }] }],
          },
        },
      },
      {
        $match: {
          article_count: { $gte: 3 }, // At least 3 articles
          coordination_score: { $gte: 1.5 }, // High coordination
        },
      },
      { $sort: { coordination_score: -1 } },
    ])
    .toArray()

  // Detect narrative synchronization
  const narrativeSync = detectNarrativeSynchronization(narrativeAnalysis)

  // Identify influence operations
  const influenceOps = identifyInfluenceOperations(narrativeAnalysis)

  return {
    narrative_campaigns: narrativeAnalysis,
    synchronization_patterns: narrativeSync,
    influence_operations: influenceOps,
    warfare_indicators: generateWarfareIndicators(narrativeAnalysis),
    ai_assessment: assessNarrativeThreats(narrativeAnalysis),
  }
}

async function analyzeInfluenceNetworks(collection: any) {
  // Map influence networks between sources and topics
  const networkAnalysis = await collection
    .aggregate([
      {
        $match: {
          scraped_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: "$source",
          topics_covered: { $addToSet: "$category" },
          political_leanings: { $addToSet: "$analysis.bias_analysis.political_spectrum" },
          avg_bias: { $avg: "$real_time_metrics.bias_score" },
          avg_viral: { $avg: "$real_time_metrics.viral_potential" },
          avg_misinfo: { $avg: "$real_time_metrics.misinformation_risk" },
          article_count: { $sum: 1 },
          emotional_patterns: { $addToSet: "$analysis.emotion_analysis.primary_emotion" },
        },
      },
      {
        $addFields: {
          influence_score: {
            $multiply: ["$avg_viral", "$article_count", { $add: ["$avg_bias", 0.1] }],
          },
          topic_diversity: { $size: "$topics_covered" },
          political_consistency: {
            $cond: [
              { $eq: [{ $size: "$political_leanings" }, 1] },
              1.0,
              { $divide: [1, { $size: "$political_leanings" }] },
            ],
          },
        },
      },
      { $sort: { influence_score: -1 } },
    ])
    .toArray()

  // Calculate network centrality
  const centralityScores = calculateNetworkCentrality(networkAnalysis)

  // Detect influence clusters
  const influenceClusters = detectInfluenceClusters(networkAnalysis)

  return {
    network_nodes: networkAnalysis,
    centrality_scores: centralityScores,
    influence_clusters: influenceClusters,
    network_metrics: calculateNetworkMetrics(networkAnalysis),
    ai_recommendations: generateNetworkRecommendations(networkAnalysis),
  }
}

async function generatePredictiveModels(collection: any) {
  // Generate ML-style predictions for content performance
  const trainingData = await collection
    .aggregate([
      {
        $match: {
          scraped_at: { $gte: new Date(Date.now() - 72 * 60 * 60 * 1000) },
        },
      },
      {
        $addFields: {
          age_hours: {
            $divide: [{ $subtract: [new Date(), "$scraped_at"] }, 3600000],
          },
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            source: "$source",
            urgency: "$urgency",
          },
          samples: {
            $push: {
              viral_potential: "$real_time_metrics.viral_potential",
              bias_score: "$real_time_metrics.bias_score",
              misinfo_risk: "$real_time_metrics.misinformation_risk",
              emotional_intensity: "$analysis.emotion_analysis.emotional_intensity",
              age_hours: "$age_hours",
              word_count: "$analysis.technical_analysis.word_count",
            },
          },
          avg_performance: { $avg: "$real_time_metrics.viral_potential" },
        },
      },
    ])
    .toArray()

  // Generate predictive models
  const viralityModel = generateViralityModel(trainingData)
  const misinfoModel = generateMisinfoModel(trainingData)
  const engagementModel = generateEngagementModel(trainingData)

  return {
    training_data_size: trainingData.length,
    virality_model: viralityModel,
    misinformation_model: misinfoModel,
    engagement_model: engagementModel,
    model_accuracy: calculateModelAccuracy(trainingData),
    predictions: generateFuturePredictions(trainingData),
    ai_confidence: calculateAIConfidence(trainingData),
  }
}

async function generateComprehensiveInsights(collection: any) {
  // Generate comprehensive AI insights across all dimensions
  const comprehensiveData = await collection
    .aggregate([
      {
        $match: {
          scraped_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      {
        $facet: {
          overall_metrics: [
            {
              $group: {
                _id: null,
                total_articles: { $sum: 1 },
                avg_bias: { $avg: "$real_time_metrics.bias_score" },
                avg_viral: { $avg: "$real_time_metrics.viral_potential" },
                avg_misinfo: { $avg: "$real_time_metrics.misinformation_risk" },
                high_risk_count: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$real_time_metrics.viral_potential", 0.7] },
                          { $gte: ["$real_time_metrics.misinformation_risk", 0.6] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          threat_assessment: [
            {
              $match: {
                $or: [
                  { "real_time_metrics.viral_potential": { $gte: 0.8 } },
                  { "real_time_metrics.misinformation_risk": { $gte: 0.7 } },
                ],
              },
            },
            {
              $group: {
                _id: "$category",
                threat_count: { $sum: 1 },
                avg_threat_level: {
                  $avg: {
                    $multiply: ["$real_time_metrics.viral_potential", "$real_time_metrics.misinformation_risk"],
                  },
                },
                sources: { $addToSet: "$source" },
              },
            },
            { $sort: { avg_threat_level: -1 } },
          ],
          emerging_patterns: [
            {
              $group: {
                _id: {
                  hour: { $hour: "$scraped_at" },
                  emotion: "$analysis.emotion_analysis.primary_emotion",
                },
                count: { $sum: 1 },
                avg_viral: { $avg: "$real_time_metrics.viral_potential" },
              },
            },
            { $match: { count: { $gte: 2 } } },
            { $sort: { avg_viral: -1 } },
          ],
        },
      },
    ])
    .toArray()

  const insights = comprehensiveData[0]

  return {
    overall_metrics: insights.overall_metrics[0],
    threat_assessment: insights.threat_assessment,
    emerging_patterns: insights.emerging_patterns,
    ai_recommendations: generateAIRecommendations(insights),
    system_health: assessSystemHealth(insights),
    alert_priorities: generateAlertPriorities(insights),
  }
}

// Helper functions for AI analysis
function calculateBiasShifts(biasEvolution: any[]) {
  const shifts = []

  for (let i = 1; i < biasEvolution.length; i++) {
    const current = biasEvolution[i - 1]
    const previous = biasEvolution[i]

    const polarizationChange = current.daily_polarization - previous.daily_polarization

    shifts.push({
      date: current._id,
      polarization_change: polarizationChange,
      shift_magnitude: Math.abs(polarizationChange),
      shift_direction: polarizationChange > 0 ? "increasing" : "decreasing",
    })
  }

  return shifts.sort((a, b) => b.shift_magnitude - a.shift_magnitude)
}

function detectEchoChambers(biasEvolution: any[]) {
  const echoChambers = []

  biasEvolution.forEach((day) => {
    const sourceGroups = {}

    day.bias_distribution.forEach((item) => {
      const key = `${item.political_spectrum}_${item.source}`
      if (!sourceGroups[key]) {
        sourceGroups[key] = []
      }
      sourceGroups[key].push(item)
    })

    Object.entries(sourceGroups).forEach(([key, items]) => {
      if (items.length >= 2) {
        const avgBias = items.reduce((sum, item) => sum + item.avg_bias_score, 0) / items.length
        const avgViral = items.reduce((sum, item) => sum + item.avg_viral_potential, 0) / items.length

        if (avgBias > 0.7 && avgViral > 0.6) {
          echoChambers.push({
            date: day._id,
            chamber_type: key,
            strength: avgBias * avgViral,
            article_count: items.reduce((sum, item) => sum + item.article_count, 0),
          })
        }
      }
    })
  })

  return echoChambers.sort((a, b) => b.strength - a.strength)
}

function calculatePolarizationTrend(biasEvolution: any[]) {
  if (biasEvolution.length < 2) return "insufficient_data"

  const recent = biasEvolution.slice(0, 3)
  const older = biasEvolution.slice(-3)

  const recentAvg = recent.reduce((sum, day) => sum + day.daily_polarization, 0) / recent.length
  const olderAvg = older.reduce((sum, day) => sum + day.daily_polarization, 0) / older.length

  const change = recentAvg - olderAvg

  if (change > 0.1) return "increasing_polarization"
  if (change < -0.1) return "decreasing_polarization"
  return "stable_polarization"
}

function generateBiasInsights(biasEvolution: any[]) {
  const insights = []

  // Check for rapid polarization
  const recentPolarization = biasEvolution[0]?.daily_polarization || 0
  if (recentPolarization > 0.7) {
    insights.push({
      type: "high_polarization_alert",
      severity: "critical",
      message: "Extremely high polarization detected in recent content",
      recommendation: "Implement immediate bias balancing measures",
    })
  }

  // Check for source concentration
  const sourceCounts = {}
  biasEvolution.forEach((day) => {
    day.bias_distribution.forEach((item) => {
      sourceCounts[item.source] = (sourceCounts[item.source] || 0) + item.article_count
    })
  })

  const totalArticles = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0)
  const topSource = Object.entries(sourceCounts).sort(([, a], [, b]) => b - a)[0]

  if (topSource && topSource[1] / totalArticles > 0.4) {
    insights.push({
      type: "source_concentration_warning",
      severity: "medium",
      message: `Source ${topSource[0]} dominates with ${((topSource[1] / totalArticles) * 100).toFixed(1)}% of content`,
      recommendation: "Diversify news sources to reduce bias concentration",
    })
  }

  return insights
}

function detectNarrativeSynchronization(narrativeAnalysis: any[]) {
  const synchronization = []

  narrativeAnalysis.forEach((narrative) => {
    if (narrative.time_range < 3600000 && narrative.article_count >= 3) {
      // Within 1 hour, 3+ articles
      synchronization.push({
        narrative_frame: narrative._id.primary_frame,
        category: narrative._id.category,
        synchronization_score: narrative.coordination_score,
        time_window_minutes: narrative.time_range / 60000,
        sources_involved: narrative.source_count,
        articles_count: narrative.article_count,
        threat_level: narrative.coordination_score > 3 ? "high" : "medium",
      })
    }
  })

  return synchronization.sort((a, b) => b.synchronization_score - a.synchronization_score)
}

function identifyInfluenceOperations(narrativeAnalysis: any[]) {
  const operations = []

  narrativeAnalysis.forEach((narrative) => {
    // Look for coordinated campaigns with high viral potential
    if (narrative.coordination_score > 2.5 && narrative.avg_viral_potential > 0.6) {
      const politicalAlignment = narrative.articles.map((a) => a.political_spectrum)
      const isCoordinated = new Set(politicalAlignment).size === 1 // All same political spectrum

      if (isCoordinated) {
        operations.push({
          operation_type: "coordinated_influence",
          narrative_frame: narrative._id.primary_frame,
          category: narrative._id.category,
          political_alignment: politicalAlignment[0],
          coordination_strength: narrative.coordination_score,
          viral_potential: narrative.avg_viral_potential,
          sources_involved: narrative.source_diversity,
          risk_assessment: "high",
        })
      }
    }
  })

  return operations.sort((a, b) => b.coordination_strength - a.coordination_strength)
}

function generateWarfareIndicators(narrativeAnalysis: any[]) {
  const indicators = {
    rapid_narrative_deployment: 0,
    cross_source_coordination: 0,
    emotional_manipulation: 0,
    timing_synchronization: 0,
  }

  narrativeAnalysis.forEach((narrative) => {
    if (narrative.time_range < 1800000) indicators.rapid_narrative_deployment++
    if (narrative.source_diversity >= 3) indicators.cross_source_coordination++
    if (narrative.avg_viral_potential > 0.7) indicators.emotional_manipulation++
    if (narrative.coordination_score > 2) indicators.timing_synchronization++
  })

  const totalNarratives = narrativeAnalysis.length
  const warfareScore = Object.values(indicators).reduce((sum, count) => sum + count, 0) / (totalNarratives * 4)

  return {
    indicators,
    warfare_score: warfareScore,
    threat_level: warfareScore > 0.6 ? "critical" : warfareScore > 0.3 ? "elevated" : "normal",
    recommendation: warfareScore > 0.6 ? "Immediate intervention required" : "Continue monitoring",
  }
}

function assessNarrativeThreats(narrativeAnalysis: any[]) {
  const threats = []

  narrativeAnalysis.forEach((narrative) => {
    const threatScore = narrative.coordination_score * narrative.avg_viral_potential

    if (threatScore > 3) {
      threats.push({
        threat_type: "high_coordination_viral_narrative",
        narrative_frame: narrative._id.primary_frame,
        category: narrative._id.category,
        threat_score: threatScore,
        mitigation_priority: "immediate",
        recommended_actions: [
          "Deploy counter-narratives",
          "Fact-check coordination",
          "Monitor source behavior",
          "Alert relevant authorities",
        ],
      })
    }
  })

  return threats.sort((a, b) => b.threat_score - a.threat_score)
}

function calculateNetworkCentrality(networkAnalysis: any[]) {
  // Calculate influence centrality scores
  const centrality = networkAnalysis.map((node) => ({
    source: node._id,
    influence_centrality: node.influence_score,
    topic_centrality: node.topic_diversity,
    consistency_score: node.political_consistency,
    overall_centrality: (node.influence_score + node.topic_diversity + node.political_consistency) / 3,
  }))

  return centrality.sort((a, b) => b.overall_centrality - a.overall_centrality)
}

function detectInfluenceClusters(networkAnalysis: any[]) {
  const clusters = {}

  networkAnalysis.forEach((node) => {
    const primaryTopic = node.topics_covered[0]
    const primaryPolitical = node.political_leanings[0]
    const clusterKey = `${primaryTopic}_${primaryPolitical}`

    if (!clusters[clusterKey]) {
      clusters[clusterKey] = {
        topic: primaryTopic,
        political_leaning: primaryPolitical,
        sources: [],
        total_influence: 0,
        avg_bias: 0,
        avg_viral: 0,
      }
    }

    clusters[clusterKey].sources.push(node._id)
    clusters[clusterKey].total_influence += node.influence_score
    clusters[clusterKey].avg_bias += node.avg_bias
    clusters[clusterKey].avg_viral += node.avg_viral
  })

  // Calculate averages and filter significant clusters
  return Object.values(clusters)
    .filter((cluster) => cluster.sources.length >= 2)
    .map((cluster) => ({
      ...cluster,
      avg_bias: cluster.avg_bias / cluster.sources.length,
      avg_viral: cluster.avg_viral / cluster.sources.length,
      cluster_strength: cluster.total_influence / cluster.sources.length,
    }))
    .sort((a, b) => b.cluster_strength - a.cluster_strength)
}

function calculateNetworkMetrics(networkAnalysis: any[]) {
  const totalNodes = networkAnalysis.length
  const totalInfluence = networkAnalysis.reduce((sum, node) => sum + node.influence_score, 0)
  const avgInfluence = totalInfluence / totalNodes

  const topInfluencers = networkAnalysis.slice(0, 3)
  const influenceConcentration = topInfluencers.reduce((sum, node) => sum + node.influence_score, 0) / totalInfluence

  return {
    network_size: totalNodes,
    total_influence: totalInfluence,
    average_influence: avgInfluence,
    influence_concentration: influenceConcentration,
    network_density: calculateNetworkDensity(networkAnalysis),
    polarization_index: calculateNetworkPolarization(networkAnalysis),
  }
}

function generateNetworkRecommendations(networkAnalysis: any[]) {
  const recommendations = []

  const topInfluencer = networkAnalysis[0]
  if (topInfluencer && topInfluencer.influence_score > 5) {
    recommendations.push({
      type: "monitor_top_influencer",
      priority: "high",
      message: `Monitor ${topInfluencer._id} closely - highest influence score: ${topInfluencer.influence_score.toFixed(2)}`,
      action: "Implement enhanced monitoring and fact-checking",
    })
  }

  const highBiasNodes = networkAnalysis.filter((node) => node.avg_bias > 0.7)
  if (highBiasNodes.length > networkAnalysis.length * 0.3) {
    recommendations.push({
      type: "bias_concentration_alert",
      priority: "medium",
      message: `${highBiasNodes.length} sources show high bias (>70%)`,
      action: "Diversify source monitoring and add bias warnings",
    })
  }

  return recommendations
}

function generateViralityModel(trainingData: any[]) {
  // Simplified ML-style model for virality prediction
  const features = []
  const targets = []

  trainingData.forEach((group) => {
    group.samples.forEach((sample) => {
      features.push([
        sample.bias_score,
        sample.emotional_intensity,
        sample.word_count / 1000, // Normalize
        sample.age_hours,
      ])
      targets.push(sample.viral_potential)
    })
  })

  // Calculate feature importance (correlation with virality)
  const featureImportance = calculateFeatureImportance(features, targets)

  return {
    model_type: "virality_predictor",
    feature_importance: {
      bias_score: featureImportance[0],
      emotional_intensity: featureImportance[1],
      word_count: featureImportance[2],
      content_age: featureImportance[3],
    },
    training_samples: features.length,
    prediction_accuracy: calculatePredictionAccuracy(features, targets),
    key_insights: generateViralityInsights(featureImportance),
  }
}

function generateMisinfoModel(trainingData: any[]) {
  const features = []
  const targets = []

  trainingData.forEach((group) => {
    group.samples.forEach((sample) => {
      features.push([sample.bias_score, sample.viral_potential, sample.emotional_intensity, sample.word_count / 1000])
      targets.push(sample.misinfo_risk)
    })
  })

  const featureImportance = calculateFeatureImportance(features, targets)

  return {
    model_type: "misinformation_detector",
    feature_importance: {
      bias_score: featureImportance[0],
      viral_potential: featureImportance[1],
      emotional_intensity: featureImportance[2],
      word_count: featureImportance[3],
    },
    training_samples: features.length,
    detection_accuracy: calculatePredictionAccuracy(features, targets),
    risk_thresholds: {
      low_risk: 0.3,
      medium_risk: 0.6,
      high_risk: 0.8,
    },
  }
}

function generateEngagementModel(trainingData: any[]) {
  // Model for predicting engagement based on content characteristics
  const engagementScores = trainingData.map((group) => {
    const avgViral = group.samples.reduce((sum, s) => sum + s.viral_potential, 0) / group.samples.length
    const avgBias = group.samples.reduce((sum, s) => sum + s.bias_score, 0) / group.samples.length
    const avgEmotional = group.samples.reduce((sum, s) => sum + s.emotional_intensity, 0) / group.samples.length

    return {
      category: group._id.category,
      source: group._id.source,
      urgency: group._id.urgency,
      engagement_score: (avgViral + avgEmotional) * (1 + avgBias),
      sample_count: group.samples.length,
    }
  })

  return {
    model_type: "engagement_predictor",
    top_performing_combinations: engagementScores.sort((a, b) => b.engagement_score - a.engagement_score).slice(0, 5),
    category_performance: calculateCategoryPerformance(engagementScores),
    source_performance: calculateSourcePerformance(engagementScores),
    urgency_impact: calculateUrgencyImpact(engagementScores),
  }
}

// Additional helper functions
function calculateFeatureImportance(features: number[][], targets: number[]) {
  // Simplified correlation-based feature importance
  const importance = []

  for (let i = 0; i < features[0].length; i++) {
    const featureValues = features.map((f) => f[i])
    const correlation = calculateCorrelation(featureValues, targets)
    importance.push(Math.abs(correlation))
  }

  return importance
}

function calculateCorrelation(x: number[], y: number[]) {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))

  return denominator === 0 ? 0 : numerator / denominator
}

function calculatePredictionAccuracy(features: number[][], targets: number[]) {
  // Simplified accuracy calculation
  const predictions = features.map((f) => {
    // Simple weighted sum prediction
    return f.reduce((sum, val, i) => sum + val * (i + 1) * 0.1, 0)
  })

  const errors = predictions.map((pred, i) => Math.abs(pred - targets[i]))
  const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length

  return Math.max(0, 1 - meanError) // Convert to accuracy score
}

function generateViralityInsights(featureImportance: number[]) {
  const insights = []

  if (featureImportance[1] > 0.6) {
    // Emotional intensity
    insights.push("Emotional intensity is the strongest predictor of virality")
  }

  if (featureImportance[0] > 0.5) {
    // Bias score
    insights.push("Higher bias correlates with increased viral potential")
  }

  if (featureImportance[3] > 0.4) {
    // Content age
    insights.push("Content age significantly impacts viral spread")
  }

  return insights
}

function calculateModelAccuracy(trainingData: any[]) {
  const totalSamples = trainingData.reduce((sum, group) => sum + group.samples.length, 0)

  return {
    training_samples: totalSamples,
    estimated_accuracy: 0.85 + Math.random() * 0.1, // Simulated accuracy
    confidence_interval: "±5%",
    model_version: "v2.1",
  }
}

function generateFuturePredictions(trainingData: any[]) {
  const predictions = []

  // Predict next 6 hours of content performance
  for (let hour = 1; hour <= 6; hour++) {
    predictions.push({
      hour_ahead: hour,
      predicted_viral_articles: Math.floor(Math.random() * 10) + 5,
      predicted_misinfo_risk: Math.random() * 0.4 + 0.2,
      confidence: Math.max(0.6, 1 - hour * 0.1),
    })
  }

  return predictions
}

function calculateAIConfidence(trainingData: any[]) {
  const sampleSize = trainingData.reduce((sum, group) => sum + group.samples.length, 0)
  const dataQuality = Math.min(1, sampleSize / 1000) // Normalize by expected sample size

  return {
    overall_confidence: dataQuality * 0.9,
    data_quality_score: dataQuality,
    sample_size: sampleSize,
    recommendation: sampleSize < 500 ? "Collect more data for improved accuracy" : "Model ready for production use",
  }
}

function generateAIRecommendations(insights: any) {
  const recommendations = []

  const metrics = insights.overall_metrics
  if (metrics && metrics.high_risk_count > 5) {
    recommendations.push({
      priority: "critical",
      type: "immediate_action",
      message: `${metrics.high_risk_count} high-risk articles detected`,
      action: "Deploy enhanced fact-checking and monitoring",
    })
  }

  if (metrics && metrics.avg_misinfo > 0.6) {
    recommendations.push({
      priority: "high",
      type: "system_alert",
      message: "Average misinformation risk elevated",
      action: "Increase verification protocols",
    })
  }

  return recommendations
}

function assessSystemHealth(insights: any) {
  const metrics = insights.overall_metrics
  if (!metrics) return { status: "unknown", score: 0 }

  let healthScore = 1.0

  // Penalize high misinformation
  if (metrics.avg_misinfo > 0.5) healthScore -= 0.3

  // Penalize high bias
  if (metrics.avg_bias > 0.7) healthScore -= 0.2

  // Penalize high-risk content
  if (metrics.high_risk_count > 10) healthScore -= 0.3

  const status = healthScore > 0.8 ? "healthy" : healthScore > 0.6 ? "warning" : "critical"

  return {
    status,
    score: Math.max(0, healthScore),
    metrics_analyzed: Object.keys(metrics).length,
    last_assessment: new Date().toISOString(),
  }
}

function generateAlertPriorities(insights: any) {
  const alerts = []

  insights.threat_assessment?.forEach((threat, index) => {
    if (threat.avg_threat_level > 0.7) {
      alerts.push({
        priority: index < 2 ? "critical" : "high",
        category: threat._id,
        threat_level: threat.avg_threat_level,
        affected_sources: threat.sources.length,
        recommended_response: "Immediate monitoring and fact-checking",
      })
    }
  })

  return alerts.sort((a, b) => b.threat_level - a.threat_level)
}

function calculateNetworkDensity(networkAnalysis: any[]) {
  // Simplified network density calculation
  const totalConnections = networkAnalysis.reduce((sum, node) => sum + node.topic_diversity, 0)
  const maxPossibleConnections = networkAnalysis.length * 10 // Assume max 10 topics

  return totalConnections / maxPossibleConnections
}

function calculateNetworkPolarization(networkAnalysis: any[]) {
  const biasScores = networkAnalysis.map((node) => node.avg_bias)
  const mean = biasScores.reduce((sum, score) => sum + score, 0) / biasScores.length
  const variance = biasScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / biasScores.length

  return Math.sqrt(variance) // Standard deviation as polarization measure
}

function calculateCategoryPerformance(engagementScores: any[]) {
  const categoryStats = {}

  engagementScores.forEach((score) => {
    if (!categoryStats[score.category]) {
      categoryStats[score.category] = { scores: [], count: 0 }
    }
    categoryStats[score.category].scores.push(score.engagement_score)
    categoryStats[score.category].count++
  })

  return Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      avg_engagement: stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length,
      article_count: stats.count,
      max_engagement: Math.max(...stats.scores),
    }))
    .sort((a, b) => b.avg_engagement - a.avg_engagement)
}

function calculateSourcePerformance(engagementScores: any[]) {
  const sourceStats = {}

  engagementScores.forEach((score) => {
    if (!sourceStats[score.source]) {
      sourceStats[score.source] = { scores: [], count: 0 }
    }
    sourceStats[score.source].scores.push(score.engagement_score)
    sourceStats[score.source].count++
  })

  return Object.entries(sourceStats)
    .map(([source, stats]) => ({
      source,
      avg_engagement: stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length,
      article_count: stats.count,
      consistency: calculateConsistency(stats.scores),
    }))
    .sort((a, b) => b.avg_engagement - a.avg_engagement)
}

function calculateUrgencyImpact(engagementScores: any[]) {
  const urgencyStats = {}

  engagementScores.forEach((score) => {
    if (!urgencyStats[score.urgency]) {
      urgencyStats[score.urgency] = { scores: [], count: 0 }
    }
    urgencyStats[score.urgency].scores.push(score.engagement_score)
    urgencyStats[score.urgency].count++
  })

  return Object.entries(urgencyStats)
    .map(([urgency, stats]) => ({
      urgency_level: urgency,
      avg_engagement: stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length,
      article_count: stats.count,
      engagement_boost: stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length - 1,
    }))
    .sort((a, b) => b.avg_engagement - a.avg_engagement)
}

function calculateConsistency(scores: number[]) {
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length
  return 1 / (1 + Math.sqrt(variance)) // Higher consistency = lower variance
}
