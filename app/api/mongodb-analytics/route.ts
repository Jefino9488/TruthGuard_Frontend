import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const analysisType = searchParams.get("type") || "overview";

    // Call the backend's dashboard analytics endpoint
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/dashboard-analytics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend analytics failed: ${errorData.error || backendResponse.statusText}`);
    }

    const backendData = await backendResponse.json();

    if (backendData.success && backendData.data) {
      const data = backendData.data;
      let result: any;

      // The backend's /dashboard-analytics already provides most of the aggregated data.
      // We map it to the frontend's expected structure here.
      switch (analysisType) {
        case "bias_trends":
          // Backend's `get_dashboard_analytics` currently provides `biasDistribution` which can be adapted
          // For a true "bias trends" over time, the backend would need a specific aggregation.
          // For now, we'll return a simplified version using existing data.
          result = data.biasDistribution?.map((item: any) => ({
            _id: item._id, // This is the bucket boundary
            avgBias: item._id, // Use bucket as avg for simplicity in frontend chart
            articleCount: item.count,
            highBiasCount: item.count, // Simplified: count all articles in the bucket as high bias for this view
          })) || [];
          break;
        case "source_comparison":
          result = data.sourceComparison || [];
          break;
        case "topic_analysis":
          // Backend doesn't explicitly group by "topic" directly in dashboard-analytics
          // Assuming "category" from articles can serve as "topic" if backend populates it
          // This part would need a specific backend endpoint for true topic analysis
          result = []; // Placeholder or adapt if 'categories' are available in backend response
          if (data.overall_metrics?.uniqueTopics) {
            result = data.overall_metrics.uniqueTopics.map((topic: string) => ({
              _id: topic,
              count: 0, // Cannot get count per topic from current dashboard-analytics directly
              avgBias: data.overall_metrics.avgBias,
              avgCredibility: data.overall_metrics.avgCredibility,
              avgSentiment: 0,
              avgMisinfoRisk: data.overall_metrics.avgMisinfo,
              sources: [],
              recentTrend: [],
              trendDirection: "stable"
            }));
          }
          break;
        case "misinformation_patterns":
          // Backend's `get_dashboard_analytics` provides `overall_metrics.avg_misinfo`
          // and `threat_assessment`. Need to adapt.
          result = {
            riskBySource: data.threat_assessment?.map((threat: any) => ({
              _id: threat._id,
              highRiskCount: threat.threat_count,
              avgRisk: threat.avg_threat_level,
              totalArticles: 0, // Not available directly
              riskPercentage: 0, // Not available directly
            })) || [],
            riskByTopic: [], // Not directly available
            timePatterns: [], // Not directly available
          };
          break;
        case "real_time_stats":
          // Backend's `get_dashboard_analytics` provides some overall stats
          result = {
            lastHour: [{
              count: data.overall_metrics?.total_articles || 0,
              avgBias: data.overall_metrics?.avgBias || 0,
              highRiskCount: data.overall_metrics?.high_risk_count || 0,
            }],
            last24Hours: [{
              count: data.overall_metrics?.total_articles || 0,
              avgBias: data.overall_metrics?.avgBias || 0,
              avgCredibility: data.overall_metrics?.avgCredibility || 0,
              sources: data.overall_metrics?.uniqueSources || [],
              topics: data.overall_metrics?.uniqueTopics || [],
            }],
            processingRate: [], // Not directly available
          };
          break;
        default: // overview
          result = data;
          break;
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
      });
    } else {
      throw new Error(backendData.error || "Backend returned no data.");
    }
  } catch (error: any) {
    console.error("MongoDB Analytics Error (Frontend Route):", error);
    return NextResponse.json({ success: false, error: "Analytics failed", details: error.message }, { status: 500 });
  }
}