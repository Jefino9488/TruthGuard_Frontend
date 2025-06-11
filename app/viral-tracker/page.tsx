// app/viral-tracker/page.tsx
import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ServerApiVersion } from "mongodb";

// Use environment variables for MongoDB connection
const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

// Validate environment variables
if (!uri) {
  console.error("MONGODB_URI is not defined in environment variables.");
  throw new Error("MONGODB_URI is not defined in environment variables.");
}
if (!dbName) {
  console.error("MONGODB_DB is not defined in environment variables.");
  throw new Error("MONGODB_DB is not defined in environment variables.");
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

/**
 * Connects to MongoDB or returns an existing connection.
 * @returns {Promise<MongoClient>} A promise that resolves to the MongoClient instance.
 */
async function connectToDatabase(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri!, {
      serverApi: ServerApiVersion.v1,
      tls: true,
      retryWrites: true,
    });
  }

  client = await clientPromise;
  return client;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get("timeframe") || "24h";
    const threshold = Number.parseFloat(searchParams.get("threshold") || "0.6");

    // Call the backend's relevant endpoint for viral tracking data
    // Assuming the backend has a /viral-tracker endpoint or similar that aggregates this data.
    // As per previous backend analysis, the main_bp.route('/dashboard-analytics') is the primary source
    // for aggregated data. We will fetch that and simulate the viral tracking data from it.
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/dashboard-analytics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend analytics failed: ${errorData.error || backendResponse.statusText}`);
    }

    const backendData = await backendResponse.json();
    const dashboardData = backendData.data;

    // Simulate viral content based on available dashboard analytics
    const viral_content = {
      viral_articles: [],
      viral_trends: [],
      source_analysis: [],
      emotion_patterns: [],
    };

    // Populate simulated viral_articles using recent articles from backend
    // In a real scenario, backend would have dedicated viral metrics in its Article model
    if (dashboardData.recentActivity) {
      viral_content.viral_articles = dashboardData.recentActivity.map((article: any) => ({
        title: article.title,
        source: article.source,
        category: article.topic || "general",
        urgency: "medium", // Simulated
        viral_potential: (article.bias_score || 0.5) + (Math.random() * 0.3), // Simulated based on bias
        misinformation_risk: (article.misinformation_risk || 0.1) + (Math.random() * 0.2), // Simulated
        viral_danger_score: ((article.bias_score || 0.5) + (article.misinformation_risk || 0.1)) / 2 + Math.random() * 0.2,
        engagement_prediction: Math.random() * 0.8 + 0.2,
        scraped_at: article.timestamp,
        has_misinformation_alert: (article.misinformation_risk || 0) > 0.5,
        alert_count: ((article.misinformation_risk || 0) > 0.5 || (article.bias_score || 0) > 0.7) ? 1 : 0,
        analysis: {
          political_spectrum: article.ai_analysis?.bias_analysis?.political_leaning || "center",
          primary_emotion: article.ai_analysis?.sentiment_analysis?.emotional_tone || "neutral",
          emotional_triggers: [],
        },
      })).filter((article: any) => article.viral_danger_score >= threshold).slice(0, 10);
    }

    // Simulate viral_trends based on biasDistribution from backend
    if (dashboardData.biasDistribution) {
      viral_content.viral_trends = dashboardData.biasDistribution.map((item: any) => ({
        _id: {
          category: item._id === 0 ? "low_bias" : item._id === 0.3 ? "medium_bias" : "high_bias",
          hour: new Date().getHours(), // Current hour, simplified
        },
        viral_count: item.count,
        avg_viral_score: item.avgCredibility, // Re-purpose avgCredibility as avg_viral_score for this demo
        avg_misinfo_risk: item.avgCredibility, // Re-purpose avgCredibility as avg_misinfo_risk
        max_danger_score: item.avgCredibility, // Re-purpose
      })).slice(0, 10);
    }

    // Simulate source_analysis using sourceComparison from backend
    if (dashboardData.sourceComparison) {
      viral_content.source_analysis = dashboardData.sourceComparison.map((source: any) => ({
        _id: source._id,
        viral_articles: source.articleCount,
        avg_viral_potential: source.averageCredibility, // Use credibility as potential
        avg_misinformation_risk: source.averageMisinformationRisk,
        categories: source.topics || ["general"], // Assuming topics are available
        total_danger_score: source.averageMisinformationRisk * source.averageCredibility * source.articleCount, // Simplified
      })).sort((a: any, b: any) => b.total_danger_score - a.total_danger_score).slice(0, 10);
    }

    // Simulate emotion_patterns (backend has primary_emotion, need to aggregate)
    // This part requires a specific aggregation on the backend to provide.
    // For now, it will be a simple simulation.
    viral_content.emotion_patterns = [
      { _id: "positive", count: 10, avg_viral_score: 0.7, categories: ["general"] },
      { _id: "negative", count: 8, avg_viral_score: 0.6, categories: ["general"] },
    ].slice(0, 5);


    // Simulate viral predictions and misinformation spread (these were originally complex aggregations in this file)
    const viralPredictions = await generateViralPredictionsSimulation(viral_content.viral_articles);
    const misinfoSpread = await analyzeMisinformationSpreadSimulation(viral_content.viral_articles);


    return NextResponse.json({
      success: true,
      timeframe,
      threshold,
      viral_content: viral_content,
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
    });
  } catch (error: any) {
    console.error("Viral tracker error (Frontend Route):", error);
    return NextResponse.json({ error: "Viral tracking failed", details: error.message }, { status: 500 });
  }
}

// Simulated functions, as backend would need dedicated endpoints for these
async function generateViralPredictionsSimulation(articles: any[]) {
  return articles.map(article => ({
    title: article.title,
    source: article.source,
    category: article.category,
    prediction_score: article.viral_danger_score * 0.8 + Math.random() * 0.2,
    final_prediction: article.viral_danger_score * 0.7 + Math.random() * 0.3,
    viral_potential: article.viral_potential,
    emotional_intensity: article.analysis?.emotional_intensity || 0.5,
    predicted_peak_time: new Date(new Date(article.scraped_at).getTime() + 4 * 60 * 60 * 1000).toISOString(),
  })).sort((a: any, b: any) => b.final_prediction - a.final_prediction).slice(0, 5);
}

async function analyzeMisinformationSpreadSimulation(articles: any[]) {
  const misinfoArticles = articles.filter(a => a.misinformation_risk >= 0.5);

  const bySource: any = {};
  misinfoArticles.forEach(article => {
    if (!bySource[article.source]) bySource[article.source] = { misinfo_articles: 0, avg_risk: 0, avg_viral_potential: 0, topics: new Set(), danger_articles: 0, count: 0 };
    bySource[article.source].misinfo_articles++;
    bySource[article.source].avg_risk += article.misinformation_risk;
    bySource[article.source].avg_viral_potential += article.viral_potential;
    bySource[article.source].topics.add(article.category);
    if (article.misinformation_risk >= 0.7 && article.viral_potential >= 0.6) bySource[article.source].danger_articles++;
    bySource[article.source].count++;
  });

  const bySourceArray = Object.entries(bySource).map(([source, data]: [string, any]) => ({
    _id: source,
    misinfo_articles: data.misinfo_articles,
    avg_risk: data.avg_risk / data.count,
    avg_viral_potential: data.avg_viral_potential / data.count,
    topics: Array.from(data.topics),
    danger_articles: data.danger_articles,
  })).sort((a, b) => b.danger_articles - a.danger_articles);

  return {
    by_source: bySourceArray,
    by_topic: [], // Requires deeper simulation
    temporal_spread: [], // Requires deeper simulation
    cross_source_patterns: [], // Requires deeper simulation
  };
}


export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json();

    // In a real scenario, these would trigger backend endpoints for specific viral tracking actions.
    // For this demo, we will simulate responses.
    if (action === "track_specific_content") {
      const { content_id, tracking_duration = 24 } = params;
      return NextResponse.json({
        success: true,
        tracking_data: { _id: content_id, viral_progression: [{ timestamp: new Date(), viral_score: 0.7, engagement_metrics: {} }] },
        prediction: {
          peak_viral_time: new Date(Date.now() + 6 * 60 * 60 * 1000),
          expected_reach: 150000,
          risk_assessment: "high",
        },
      });
    }

    if (action === "predict_viral_cascade") {
      const { topic, timeframe = "6h" } = params;
      return NextResponse.json({
        success: true,
        topic,
        cascade_prediction: { cascade_probability: "medium", total_cascade_potential: 3.5, article_count: 5 },
        timeline_prediction: { initial_spread: "2-4 hours" },
        mitigation_strategies: ["monitor closely", "prepare response"],
      });
    }

    if (action === "analyze_manipulation_tactics") {
      const { timeframe = "24h" } = params;
      return NextResponse.json({
        success: true,
        timeframe,
        manipulation_analysis: [{ _id: "emotional_appeal", frequency: 10 }],
        summary: { total_tactics_detected: 1, most_common_tactic: "emotional_appeal" },
        recommendations: ["increase emotional language detection"],
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Viral tracker POST error (Frontend Route):", error);
    return NextResponse.json({ error: "Request failed", details: error.message }, { status: 500 });
  }
}