import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ServerApiVersion } from "mongodb"

// Ensure your MongoDB connection string and database name are in your environment variables.
// For example, in a .env.local file:
// MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/
// MONGODB_DB=truthguard_db

const uri = 'mongodb+srv://jefino9488:Jefino1537@truthguardcluster.2wku5ai.mongodb.net/?retryWrites=true&w=majority&appName=TruthGuardCluster';
const dbName = 'truthguard';
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

/**
 * Handles GET requests to fetch articles from MongoDB.
 * @returns {NextResponse} A JSON response containing articles or an error message.
 */
export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('articles'); // Assuming your articles are in a collection named 'articles'

    // Fetch all articles. In a real application, you might want to add pagination or filters.
    const articles = await collection.find({}).toArray();

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error("Error fetching data from MongoDB:", error);
    return NextResponse.json(
        { success: false, message: "Failed to fetch articles", error: error.message },
        { status: 500 }
    );
  }
}

/**
 * Handles POST requests to add a new article to MongoDB.
 * This is an example, you might adapt it for your specific needs (e.g., for internal data ingestion).
 * @param {Request} req The incoming request object.
 * @returns {NextResponse} A JSON response indicating success or failure.
 */
export async function POST(req: Request) {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('articles');

    const newArticle = await req.json();

    // Basic validation for the new article structure
    if (!newArticle || !newArticle.title || !newArticle.source) {
      return NextResponse.json(
          { success: false, message: "Invalid article data. 'title' and 'source' are required." },
          { status: 400 }
      );
    }

    const result = await collection.insertOne(newArticle);

    return NextResponse.json(
        { success: true, message: "Article added successfully", insertedId: result.insertedId },
        { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding data to MongoDB:", error);
    return NextResponse.json(
        { success: false, message: "Failed to add article", error: error.message },
        { status: 500 }
    );
  }
}
