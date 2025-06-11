import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    // The backend /analyze endpoint currently does not expect a request body
    // it simply triggers the analysis task.
    // If your backend /analyze were to accept a body (e.g., specific articles to analyze),
    // you would parse request.json() here and pass it to the backend.

    console.log("Frontend API: Forwarding request to backend /analyze...");

    const backendResponse = await fetch(`${BACKEND_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Sending an empty JSON body as per backend's current expectation
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
      message: result.message || "AI analysis task triggered successfully on backend.",
      status: result.status,
    });

  } catch (error: any) {
    console.error("Frontend API: Error proxying analysis request to backend:", error);
    return NextResponse.json(
        {
          success: false,
          error: "Failed to trigger analysis task on backend.",
          details: error.message,
        },
        { status: 500 }
    );
  }
}
