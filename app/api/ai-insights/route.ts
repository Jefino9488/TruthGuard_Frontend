import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
    }

    const searchParams = request.nextUrl.searchParams;
    const analysisType = searchParams.get("type") || "comprehensive";

    // Make sure we have a valid URL by using URL constructor
    const analyticsUrl = new URL('/dashboard-analytics', BACKEND_BASE_URL).toString();

    // Call the backend's dashboard analytics endpoint
    const backendResponse = await fetch(analyticsUrl, {
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
    let insights: any = {};

    if (backendData.success && backendData.data) {
      const data = backendData.data;

      insights = {
        summary: {
          total_articles: data.totalArticles || 0,
          processed_today: data.processedToday || 0,
          avg_bias_score: data.avgBias || 0,
          avg_credibility: data.avgCredibility || 0,
        },
        trends: {
          bias_over_time: data.biasOverTime || [],
          credibility_trends: data.credibilityTrends || [],
          topic_distribution: data.topicDistribution || [],
        },
        key_findings: generateKeyFindings(data),
        metadata: {
          generated_at: new Date().toISOString(),
          analysis_type: analysisType,
          data_points: data.totalArticles || 0,
        }
      };
    }

    return NextResponse.json({
      success: true,
      insights,
      metadata: {
        timestamp: new Date().toISOString(),
        analysis_type: analysisType,
      }
    });

  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate AI insights",
      fallback_insights: generateFallbackInsights(),
    }, { status: 500 });
  }
}

function generateKeyFindings(data: any) {
  return [
    {
      type: "bias_trend",
      finding: `Average bias score is ${(data.avgBias || 0).toFixed(2)}`,
      confidence: 0.85,
    },
    {
      type: "credibility",
      finding: `Overall credibility rating is ${(data.avgCredibility || 0).toFixed(2)}`,
      confidence: 0.9,
    },
    {
      type: "topic_insight",
      finding: `Most common topic: ${data.topTopics?.[0] || "Not enough data"}`,
      confidence: 0.75,
    }
  ];
}

function generateFallbackInsights() {
  return {
    summary: {
      total_articles: 0,
      processed_today: 0,
      avg_bias_score: 0.5,
      avg_credibility: 0.5,
    },
    trends: {
      bias_over_time: [],
      credibility_trends: [],
      topic_distribution: [],
    },
    key_findings: [
      {
        type: "system_status",
        finding: "Using fallback insights due to backend service unavailability",
        confidence: 0.3,
      }
    ],
    metadata: {
      generated_at: new Date().toISOString(),
      analysis_type: "fallback",
      data_points: 0,
    }
  };
}