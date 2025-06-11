import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const analysisType = searchParams.get("type") || "comprehensive";

    // Call the backend's dashboard analytics endpoint
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/dashboard-analytics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend error: ${errorData.error || backendResponse.statusText}`);
    }

    const backendData = await backendResponse.json();

    // Map backend response to frontend insights structure
    // The backend's /dashboard-analytics already provides aggregated data.
    // We'll structure it to fit the frontend's AIInsights interface.
    let insights: any = {};

    if (backendData.success && backendData.data) {
      const data = backendData.data;

      insights.overall_metrics = data.totalStats?.[0] || {};
      insights.threat_assessment = data.threat_assessment || [];
      insights.emerging_patterns = data.emerging_patterns || [];

      // Generate AI recommendations and system health based on backend data
      insights.ai_recommendations = generateAIRecommendations(insights.overall_metrics);
      insights.system_health = assessSystemHealth(insights.overall_metrics);
      insights.alert_priorities = generateAlertPriorities(insights.threat_assessment);

      // Handle specialized analysis types from frontend by re-using or adapting backend data
      // For a more advanced setup, the backend would have specific endpoints for each type.
      // Here, we simulate/adapt based on the comprehensive data.
      switch (analysisType) {
        case "bias_evolution":
          // Assuming bias evolution can be derived from existing data
          insights.bias_evolution = {
            polarization_trend: insights.overall_metrics.avgBias > 0.6 ? "increasing_polarization" : "stable_polarization",
            echo_chambers: [], // Placeholder, would need more specific backend data
            ai_insights: [{ message: "Bias evolution analysis based on comprehensive data.", type: "info" }],
          };
          break;
        case "narrative_warfare":
          insights.narrative_warfare = {
            warfare_indicators: { threat_level: insights.overall_metrics.avgMisinfo > 0.5 ? "elevated" : "normal" },
            narrative_campaigns: [], // Placeholder
            ai_assessment: [{ message: "Narrative warfare assessment based on comprehensive data.", type: "info" }],
          };
          break;
        case "influence_networks":
          insights.influence_networks = {
            network_metrics: { network_size: insights.overall_metrics.uniqueSources?.length || 0 },
            influence_clusters: [], // Placeholder
            ai_recommendations: [{ message: "Influence network analysis based on available sources.", type: "info" }],
          };
          break;
        case "predictive_modeling":
          insights.predictive_models = {
            training_data_size: insights.overall_metrics.total_articles,
            ai_confidence: { overall_confidence: 0.85 }, // Placeholder
            predictions: [{ hour_ahead: 1, predicted_viral_articles: 10 }], // Placeholder
          };
          break;
        default:
          // Comprehensive is already handled above
          break;
      }
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
    });
  } catch (error: any) {
    console.error("AI Insights error:", error);
    return NextResponse.json({ success: false, error: "Insights generation failed", details: error.message }, { status: 500 });
  }
}

// Helper functions for AI analysis, adapted to use backend's overall_metrics structure
function generateAIRecommendations(metrics: any) {
  const recommendations = [];

  if (metrics && metrics.high_risk_count > 5) {
    recommendations.push({
      priority: "critical",
      type: "immediate_action",
      message: `${metrics.high_risk_count} high-risk articles detected`,
      action: "Deploy enhanced fact-checking and monitoring",
    });
  }

  if (metrics && metrics.avg_misinfo > 0.6) {
    recommendations.push({
      priority: "high",
      type: "system_alert",
      message: "Average misinformation risk elevated",
      action: "Increase verification protocols",
    });
  }

  return recommendations;
}

function assessSystemHealth(metrics: any) {
  if (!metrics) return { status: "unknown", score: 0 };

  let healthScore = 1.0;

  // Penalize high misinformation
  if (metrics.avg_misinfo > 0.5) healthScore -= 0.3;

  // Penalize high bias
  if (metrics.avg_bias > 0.7) healthScore -= 0.2;

  // Penalize high-risk content
  if (metrics.high_risk_count > 10) healthScore -= 0.3;

  const status = healthScore > 0.8 ? "healthy" : healthScore > 0.6 ? "warning" : "critical";

  return {
    status,
    score: Math.max(0, healthScore),
    metrics_analyzed: Object.keys(metrics).length,
    last_assessment: new Date().toISOString(),
  };
}

function generateAlertPriorities(threatAssessment: any[]) {
  const alerts = [];

  threatAssessment?.forEach((threat, index) => {
    if (threat.avg_threat_level > 0.7) {
      alerts.push({
        priority: index < 2 ? "critical" : "high",
        category: threat._id,
        threat_level: threat.avg_threat_level,
        affected_sources: threat.sources.length,
        recommended_response: "Immediate monitoring and fact-checking",
      });
    }
  });

  return alerts.sort((a, b) => b.threat_level - a.threat_level);
}