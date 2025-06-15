import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
    }

    console.log("Frontend API: Forwarding request to backend /analyze...");

    // Make sure we have a valid URL by using URL constructor
    const analyzeUrl = new URL('/analyze', BACKEND_BASE_URL).toString();

    const backendResponse = await fetch(analyzeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    console.log("Backend /analyze response status:", backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend analysis failed: ${errorData.error || backendResponse.statusText}`);
    }

    const result = await backendResponse.json();
    console.log("Backend analysis trigger result:", result);

    return NextResponse.json({
      success: true,
      message: result.message || "Analysis task triggered successfully",
      task_id: result.task_id,
      status: "triggered",
      metadata: {
        triggered_at: new Date().toISOString(),
        estimated_completion: "5-10 minutes"
      }
    });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to trigger analysis",
      status: "failed",
    }, { status: 500 });
  }
}
