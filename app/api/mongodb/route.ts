import { type NextRequest, NextResponse } from "next/server";
import { MongoClient, ServerApiVersion } from "mongodb";

// Ensure your MongoDB connection string and database name are in your environment variables.
// For example, in a .env.local file:
// MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/
// MONGODB_DB=truthguard_db

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

// Validate environment variables
if (!uri) {
  console.error("MONGODB_URI is not defined in environment variables.");
  throw new Error("MONGODB_URI is not defined in environment variables.");
}
if (!dbName) {
  console.error("MONGODB_DB is not defined in environment variables.");
  throw new Error("MONGODB_DB is not defined in environment variables.");
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

/**
 * Connects to MongoDB or returns an existing connection.
 * @returns {Promise<MongoClient>} A promise that resolves to the MongoClient instance.
 */
async function connectToDatabase(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  // Reuse the promise if it's already in progress
  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri!, {
      serverApi: ServerApiVersion.v1,
      tls: true,
      retryWrites: true,
    });
  }

  client = await clientPromise;
  return client;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Handles GET requests to fetch articles from MongoDB via the backend.
 * @returns {NextResponse} A JSON response containing articles or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for pagination, sorting, etc. if needed by backend
    const { searchParams } = request.nextUrl;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sort_by = searchParams.get('sort_by') || 'published_at';
    const sort_order = searchParams.get('sort_order') || 'desc';

    // Call the backend's get_articles endpoint
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/articles?page=${page}&limit=${limit}&sort_by=${sort_by}&sort_order=${sort_order}`, {
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
    // The backend's /articles endpoint returns { articles: [...], total_results: ..., page: ..., limit: ... }
    // We want to return the articles array directly here for this frontend API route.
    return NextResponse.json({ success: true, articles: data.articles || [], total_results: data.total_results });
  } catch (error: any) {
    console.error("Error fetching data from MongoDB (via backend):", error);
    return NextResponse.json(
        { success: false, message: "Failed to fetch articles", error: error.message },
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

    // Call the backend's /analyze-manual endpoint
    const backendResponse = await fetch(`${BACKEND_BASE_URL}/analyze-manual`, {
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