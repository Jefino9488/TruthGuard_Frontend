// app/api/narrative-flow/route.ts
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
    }

    // Make sure we have a valid URL by using URL constructor
    const apiUrl = new URL('/narrative-flow', BACKEND_BASE_URL).toString();

    // Call the backend's narrative flow endpoint
    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend narrative flow failed: ${errorData.error || backendResponse.statusText}`);
    }

    const backendData = await backendResponse.json();

    if (backendData.success && backendData.data) {
      return NextResponse.json({
        success: true,
        data: backendData.data,
        generatedAt: backendData.generatedAt || new Date().toISOString(),
        mongodbFeatures: [
          "Advanced Aggregation Pipeline",
          "Time Series Analysis",
          "Text Analysis",
          "Pattern Recognition",
          "Flow Mapping",
        ],
      });
    } else {
      throw new Error(backendData.error || "Backend returned no data.");
    }
  } catch (error: any) {
    console.error("Narrative Flow Error (Frontend Route):", error);
    return NextResponse.json({ success: false, error: "Narrative flow data retrieval failed", details: error.message }, { status: 500 });
  }
}