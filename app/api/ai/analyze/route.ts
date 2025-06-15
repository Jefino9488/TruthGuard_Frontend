import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
    }

    const { content, options = {} } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    console.log("Processing content for backend analysis:", content.substring(0, 100) + "...");

    // Make sure we have a valid URL by using URL constructor
    const analyzeUrl = new URL('/analyze-manual', BACKEND_BASE_URL).toString();

    // Call the backend's manual analysis endpoint
    const backendResponse = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: content, headline: content.substring(0, 100) }),
    });

    console.log("Backend response status:", backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend analysis failed: ${errorData.error || backendResponse.statusText}`);
    }

    const result = await backendResponse.json();

    // Process and return the analysis results
    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      metadata: {
        processed_at: new Date().toISOString(),
        content_length: content.length,
        processing_time: result.processing_time,
      }
    });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);

    // Use the actual content from the request for fallback analysis
    let fallbackContent = "";
    try {
      const body = await request.json();
      fallbackContent = body.content || "";
    } catch (e) {
      console.error("Could not extract content for fallback analysis:", e);
    }

    const fallbackAnalysis = generateBasicFallbackAnalysis(fallbackContent);

    return NextResponse.json({
      success: false,
      error: error.message || "Analysis failed",
      fallback_analysis: fallbackAnalysis,
    }, { status: 500 });
  }
}

function generateBasicFallbackAnalysis(content: string) {
  const words = content.toLowerCase().split(/\s+/);
  return {
    type: "fallback_analysis",
    timestamp: new Date().toISOString(),
    word_count: words.length,
    basic_sentiment: words.some(w => ["good", "great", "excellent"].includes(w)) ? "positive" : "neutral",
    confidence: 0.3,
    note: "This is a basic fallback analysis due to backend service unavailability"
  };
}