import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ServerApiVersion } from "mongodb"

const uri =
  "mongodb+srv://TruthGuard:TruthGuard@cluster0.dhlp73u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { content, analysis, embedding, collection = "vector_search_demo" } = await request.json()

    await client.connect()
    const database = client.db("TruthGuard")
    const vectorCollection = database.collection(collection)

    // Create document with vector embedding for MongoDB Vector Search
    const document = {
      content,
      analysis,
      embedding, // Vector embedding for Atlas Vector Search
      title: content.substring(0, 100) + "...",
      source: "TruthGuard AI Chat",
      timestamp: new Date(),
      processed_at: new Date(),
      bias_score: analysis.bias_analysis?.overall_score || 0,
      misinformation_risk: analysis.misinformation_analysis?.risk_score || 0,
      credibility_score: analysis.credibility_assessment?.overall_score || 0,
      sentiment: analysis.sentiment_analysis?.overall_sentiment || 0,
      topic: analysis.technical_analysis?.key_topics?.[0] || "general",
      word_count: analysis.technical_analysis?.word_count || content.split(/\s+/).length,
      processing_model: analysis.model_version || "gemini-1.5-pro",
      vector_search_enabled: true,
    }

    const result = await vectorCollection.insertOne(document)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      message: "Content stored with vector embedding for MongoDB Vector Search",
      collection: collection,
      database: "TruthGuard",
    })
  } catch (error) {
    console.error("MongoDB Vector Storage Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to store vector data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateQueryEmbedding(query)

    await client.connect()
    const database = client.db("TruthGuard")
    const vectorCollection = database.collection("vector_search_demo")

    // Perform MongoDB Atlas Vector Search
    const results = await vectorCollection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index", // You need to create this index in MongoDB Atlas
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: limit,
          },
        },
        {
          $addFields: {
            vectorSearchScore: { $meta: "vectorSearchScore" },
          },
        },
        {
          $project: {
            title: 1,
            content: 1,
            source: 1,
            bias_score: 1,
            misinformation_risk: 1,
            credibility_score: 1,
            sentiment: 1,
            topic: 1,
            timestamp: 1,
            vectorSearchScore: 1,
            processing_model: 1,
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      success: true,
      data: results,
      query,
      searchType: "vector_search",
      database: "TruthGuard",
      collection: "vector_search_demo",
    })
  } catch (error) {
    console.error("MongoDB Vector Search Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Vector search failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}

async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: query,
        model: "text-embedding-3-small",
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.data[0].embedding
    }

    throw new Error("Failed to generate embedding")
  } catch (error) {
    console.error("Embedding generation failed:", error)
    // Return a zero vector as fallback
    return new Array(1536).fill(0)
  }
}
