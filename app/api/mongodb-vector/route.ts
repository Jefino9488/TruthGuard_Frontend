// app/api/mongodb-vector/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ServerApiVersion } from "mongodb";

// ... (MongoDB connection setup remains the same)

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// This POST method seems to be for storing data, which backend's /analyze-manual already does.
// I'm keeping it as is, but focusing on the GET for vector search.
export async function POST(request: NextRequest) {
  // ... (Existing POST logic for storing data, unchanged)
  try {
    const { content, analysis, embedding, collection = "articles" } = await request.json();

    if (!content) {
      return NextResponse.json({ success: false, error: "Content is required for vector storage." }, { status: 400 });
    }

    // Call backend's /analyze-manual endpoint which stores analysis and embeddings
    const backendAnalyzeResponse = await fetch(`${BACKEND_BASE_URL}/analyze-manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline: content.substring(0, 100), content: content }),
    });

    if (!backendAnalyzeResponse.ok) {
      const errorData = await backendAnalyzeResponse.json();
      throw new Error(`Failed to store vector data via backend analysis: ${errorData.error || backendAnalyzeResponse.statusText}`);
    }

    const backendResult = await backendAnalyzeResponse.json();

    return NextResponse.json({
      success: true,
      id: backendResult.article_meta?.article_id || "unknown",
      message: "Content processed and stored with vector embedding by the backend.",
      collection: collection,
      database: dbName,
    });
  } catch (error: any) {
    console.error("MongoDB Vector Storage Error (Frontend Route):", error);
    return NextResponse.json(
        {
          success: false,
          error: "Failed to store vector data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = Number.parseInt(searchParams.get("limit") || "5");

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    console.log(`Frontend: Calling backend /vector-search with query: "${query}", limit: ${limit}`);

    // Change: Call the backend's vector-search endpoint using POST
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/vector-search`, {
      method: "POST", // Backend's vector search is a POST request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query, limit: limit }), // Send query in the body
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend vector search failed: ${errorData.error || backendResponse.statusText}`);
    }

    const backendData = await backendResponse.json();

    if (backendData.success) {
      return NextResponse.json({
        success: true,
        data: backendData.data, // This will be the articles array from backend
        query,
        searchType: "vector_search",
        database: "truthguard",
        collection: "articles",
      });
    } else {
      throw new Error(backendData.error || "Backend vector search returned an error.");
    }

  } catch (error: any) {
    console.error("MongoDB Vector Search Error (Frontend Route):", error);
    return NextResponse.json(
        {
          success: false,
          error: "Vector search failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
    );
  }
}