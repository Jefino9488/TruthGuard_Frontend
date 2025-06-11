import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const { source, limit = 5 } = await request.json();

    // In the new setup, the frontend will trigger the backend's scraper.
    // The backend handles the actual scraping, analysis, and storage.
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/scrape`, {
      method: "POST", // Backend's trigger_scrape is POST
      headers: {
        "Content-Type": "application/json",
      },
      // Optionally pass source/limit to backend if backend's /scrape accepts it.
      // Current backend /scrape does not accept parameters, it runs its full logic.
      // So, this just triggers the backend's scheduled scrape.
      body: JSON.stringify({}),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend scraping trigger failed: ${errorData.error || backendResponse.statusText}`);
    }

    const backendResult = await backendResponse.json();

    // The backend's /scrape returns {message, status}. It does not return articles directly.
    // We should adapt the frontend's response structure to reflect this.
    return NextResponse.json({
      success: true,
      message: backendResult.message || "News scraping initiated on backend.",
      status: backendResult.status,
      // For frontend display, you might need to fetch recent articles after a delay
      // or rely on the real-time feed if it's implemented.
      scraped: 0, // Cannot get immediate count from backend trigger
      stored: 0, // Cannot get immediate count from backend trigger
      articles: [], // No articles returned immediately
      source: source || "all",
    });
  } catch (error: any) {
    console.error("News Scraping Error (Frontend Route):", error);
    return NextResponse.json(
        {
          success: false,
          error: "News scraping failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Trigger automatic news scraping on the backend
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/scrape`, {
      method: "POST", // Backend's trigger_scrape is POST
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Automatic news scraping trigger failed: ${errorData.error || backendResponse.statusText}`);
    }

    const backendResult = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: backendResult.message || "Automatic news scraping initiated on backend.",
      total_articles: 0, // Cannot get immediate count
      sources_processed: 0, // Cannot get immediate count
      articles: [], // No articles returned immediately
    });
  } catch (error: any) {
    console.error("Automatic News Scraping Error (Frontend Route):", error);
    return NextResponse.json(
        {
          success: false,
          error: "Automatic scraping failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
    );
  }
}