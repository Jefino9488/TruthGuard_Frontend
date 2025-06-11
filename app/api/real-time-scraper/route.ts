import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json();

    let backendResponse;
    let backendResult;

    if (action === "start_live_scraping") {
      // Trigger the backend's scrape endpoint
      backendResponse = await fetch(`${BACKEND_BASE_URL}/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      backendResult = await backendResponse.json();
      if (!backendResponse.ok) {
        throw new Error(`Backend scrape failed: ${backendResult.error || backendResponse.statusText}`);
      }
      return NextResponse.json({
        success: true,
        message: backendResult.message || "Live news scraping initiated on backend.",
        results: { status: backendResult.status }, // Simplified result
      });
    }

    if (action === "analyze_trending") {
      // Fetch dashboard analytics from backend to get trending info
      backendResponse = await fetch(`${BACKEND_BASE_URL}/dashboard-analytics`, {
        method: "GET",
      });
      backendResult = await backendResponse.json();
      if (!backendResponse.ok) {
        throw new Error(`Backend analytics failed: ${backendResult.error || backendResponse.statusText}`);
      }
      // Adapt backend's dashboard analytics to frontend's trending structure
      const trending = backendResult.data?.emerging_patterns?.map((pattern: any) => ({
        category: pattern._id.emotion, // Using emotion as category for trending
        count: pattern.count,
        avg_viral_score: pattern.avg_viral,
        timestamp: new Date().toISOString(), // Use current time for simplicity
      })) || [];

      return NextResponse.json({
        success: true,
        trending,
      });
    }

    if (action === "detect_viral_misinformation") {
      // For viral misinformation, we need a specific endpoint from the backend
      // Assuming a new backend endpoint `/articles/misinformation-risk` or similar is available
      // For now, we'll fetch high-risk articles from the backend's existing endpoint.
      backendResponse = await fetch(`${BACKEND_BASE_URL}/articles/misinformation-risk?limit=5&min_risk=0.6`, {
        method: "GET",
      });
      backendResult = await backendResponse.json();
      if (!backendResponse.ok) {
        throw new Error(`Backend misinformation-risk failed: ${backendResult.error || backendResponse.statusText}`);
      }
      const viralMisinfo = backendResult.articles?.map((article: any) => ({
        title: article.title,
        source: article.source,
        misinformation_risk: article.misinformation_risk,
        viral_potential: article.viral_potential || 0.5, // Placeholder if not in backend response
        analysis_summary: article.ai_analysis?.misinformation_analysis?.red_flags?.join(", ") || "No specific flags",
      })) || [];

      return NextResponse.json({
        success: true,
        viral_misinformation: viralMisinfo,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Real-time scraper error (Frontend Route):", error);
    return NextResponse.json({ error: "Scraping/Analysis failed", details: error.message }, { status: 500 });
  }
}