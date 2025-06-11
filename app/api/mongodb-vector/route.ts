import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ServerApiVersion } from "mongodb";

// Use environment variables for MongoDB connection
const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const { content, analysis, embedding, collection = "articles" } = await request.json(); // Default to articles collection
    // In this updated setup, the backend handles storing content with embeddings
    // We will call the backend's manual-analyze or a dedicated store endpoint if it existed
    // For now, if 'analysis' and 'embedding' are already generated, we'll assume the client wants to store it.
    // However, the backend's /analyze-manual also stores. So this POST might be redundant if used after manual-analyze.
    // Re-evaluating based on backend's structure: the backend's `analyze-manual` already stores.
    // So, this frontend POST will primarily be for initial seeding or if a new 'store' endpoint is made on backend.
    // For this update, we will treat this as a signal to trigger a backend analysis that stores the content.

    if (!content) {
      return NextResponse.json({ success: false, error: "Content is required for vector storage." }, { status: 400 });
    }

    // Call backend's /analyze-manual endpoint which stores analysis and embeddings
    const backendAnalyzeResponse = await fetch(`${BACKEND_BASE_URL}/analyze-manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline: content.substring(0, 100), content: content }), // Pass content to backend
    });

    if (!backendAnalyzeResponse.ok) {
      const errorData = await backendAnalyzeResponse.json();
      throw new Error(`Failed to store vector data via backend analysis: ${errorData.error || backendAnalyzeResponse.statusText}`);
    }

    const backendResult = await backendAnalyzeResponse.json();

    return NextResponse.json({
      success: true,
      id: backendResult.article_meta?.article_id || "unknown", // Return ID from backend if available
      message: "Content processed and stored with vector embedding by the backend.",
      collection: collection,
      database: dbName, // Using the TruthGuard database now
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

    // Call the backend's vector-search endpoint
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/vector-search`, {
      method: "POST", // Backend's vector search is a POST request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query, limit: limit }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend vector search failed: ${errorData.error || backendResponse.statusText}`);
    }

    const backendData = await backendResponse.json();

    if (backendData.success) {
      return NextResponse.json({
        success: true,
        data: backendData.data, // This will be the articles array
        query,
        searchType: "vector_search",
        database: dbName,
        collection: "articles", // Backend returns from 'articles' collection
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

// generateQueryEmbedding function will be on the backend, as part of GeminiAnalyzerTask
// The frontend will send the text query, and the backend will generate the embedding.
// The backend's /vector-search endpoint expects a text query, not an embedding directly from frontend.