import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase, dbName } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);

    const backendUrl = process.env.BACKEND_BASE_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_BASE_URL is not defined in environment variables");
    }

    // Get analytics data first
    const analyticsData = await db.collection("dashboard-analytics").findOne({}) || { data: { overall_metrics: {}, biasDistribution: [] } };

    // Extract query parameters for pagination, sorting, etc.
    const { searchParams } = request.nextUrl;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sort_by = searchParams.get('sort_by') || 'published_at';
    const sort_order = searchParams.get('sort_order') || 'desc';

    // Call the backend's get_articles endpoint
    const backendResponse = await fetch(`${backendUrl}/articles?page=${page}&limit=${limit}&sort_by=${sort_by}&sort_order=${sort_order}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Failed to fetch articles from backend: ${errorData.error || backendResponse.statusText}`);
    }

    const data = await backendResponse.json();

    return NextResponse.json({
      success: true,
      articles: data.articles || [],
      total_results: data.total_results,
      analytics: {
        overall_metrics: analyticsData.data?.overall_metrics || {},
        bias_distribution: analyticsData.data?.biasDistribution || []
      }
    });
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to add a new article to MongoDB via the backend's manual analysis endpoint.
 * This will trigger analysis and storage on the backend.
 * @param {Request} req The incoming request object.
 * @returns {NextResponse} A JSON response indicating success or failure.
 */
export async function POST(req: Request) {
  try {
    const newArticle = await req.json();

    // Basic validation for the new article structure before sending to backend
    if (!newArticle || (!newArticle.title && !newArticle.url)) { // Backend requires either title+content OR url
      return NextResponse.json(
          { success: false, message: "Invalid article data. 'title' and 'content' or 'url' are required." },
          { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_BASE_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_BASE_URL is not defined in environment variables");
    }

    // Call the backend's /analyze-manual endpoint
    const backendResponse = await fetch(`${backendUrl}/analyze-manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Backend expects either {"headline": "...", "content": "..."} OR {"url": "..."}
      body: JSON.stringify(newArticle.url ? { url: newArticle.url } : { headline: newArticle.title, content: newArticle.content || "" }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Failed to add/analyze article via backend: ${errorData.error || backendResponse.statusText}`);
    }

    const backendResult = await backendResponse.json();
    // The backend's analyze-manual returns success, analysis, and article_meta
    if (backendResult.success) {
      return NextResponse.json(
          { success: true, message: "Article processed and stored by backend successfully", insertedId: backendResult.article_meta?.article_id, analysis_result: backendResult.analysis },
          { status: 201 }
      );
    } else {
      throw new Error(backendResult.error || "Backend failed to process article.");
    }

  } catch (error: any) {
    console.error("Error adding data to MongoDB (via backend):", error);
    return NextResponse.json(
        { success: false, message: "Failed to add article", error: error.message },
        { status: 500 }
    );
  }
}