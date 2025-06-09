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

// News sources for real-time scraping
const NEWS_SOURCES = [
  {
    name: "Reuters",
    url: "https://www.reuters.com/world/",
    rss: "https://feeds.reuters.com/reuters/topNews",
  },
  {
    name: "AP News",
    url: "https://apnews.com/",
    rss: "https://feeds.apnews.com/rss/topnews",
  },
  {
    name: "BBC",
    url: "https://www.bbc.com/news",
    rss: "https://feeds.bbci.co.uk/news/rss.xml",
  },
  {
    name: "CNN",
    url: "https://www.cnn.com/",
    rss: "http://rss.cnn.com/rss/edition.rss",
  },
  {
    name: "NPR",
    url: "https://www.npr.org/",
    rss: "https://feeds.npr.org/1001/rss.xml",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { source, limit = 5 } = await request.json()

    // Simulate news scraping (in production, you'd use actual web scraping)
    const articles = await scrapeNewsFromSource(source, limit)

    // Store articles in MongoDB with AI analysis
    const storedArticles = []
    for (const article of articles) {
      const analysisResult = await analyzeAndStoreArticle(article)
      if (analysisResult.success) {
        storedArticles.push(analysisResult.data)
      }
    }

    return NextResponse.json({
      success: true,
      scraped: articles.length,
      stored: storedArticles.length,
      articles: storedArticles,
      source: source || "all",
    })
  } catch (error) {
    console.error("News Scraping Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "News scraping failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Trigger automatic news scraping for all sources
    const allArticles = []

    for (const source of NEWS_SOURCES) {
      const articles = await scrapeNewsFromSource(source.name, 3)
      for (const article of articles) {
        const analysisResult = await analyzeAndStoreArticle(article)
        if (analysisResult.success) {
          allArticles.push(analysisResult.data)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Automatic news scraping completed",
      total_articles: allArticles.length,
      sources_processed: NEWS_SOURCES.length,
      articles: allArticles.slice(0, 10), // Return first 10 for preview
    })
  } catch (error) {
    console.error("Automatic News Scraping Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Automatic scraping failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function scrapeNewsFromSource(sourceName: string, limit: number) {
  // Simulate news scraping with realistic sample data
  const sampleArticles = [
    {
      title: "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
      content:
        "World leaders at the Global Climate Summit have reached a groundbreaking agreement to reduce carbon emissions by 50% over the next decade. The agreement, signed by 195 countries, represents the most ambitious climate action plan in history. Scientists and environmental groups have praised the deal, calling it a crucial step in addressing the climate crisis. However, some critics argue that the targets may not be achievable without significant economic disruption.",
      url: `https://${sourceName.toLowerCase().replace(" ", "")}.com/climate-agreement-2024`,
      source: sourceName,
      timestamp: new Date(),
    },
    {
      title: "Tech Giants Face New Regulations on AI Development and Data Privacy",
      content:
        "Major technology companies are facing unprecedented regulatory scrutiny as governments worldwide introduce new laws governing artificial intelligence development and data privacy. The regulations require companies to implement stricter data protection measures and ensure AI systems are transparent and accountable. Industry leaders have expressed concerns about the potential impact on innovation, while privacy advocates welcome the increased oversight.",
      url: `https://${sourceName.toLowerCase().replace(" ", "")}.com/tech-regulations-2024`,
      source: sourceName,
      timestamp: new Date(),
    },
    {
      title: "Economic Markets Show Strong Recovery Following Policy Changes",
      content:
        "Global financial markets have demonstrated remarkable resilience and growth following recent policy implementations by central banks. The Dow Jones and S&P 500 have reached new highs, while unemployment rates continue to decline across major economies. Economists attribute the positive trends to strategic monetary policies and increased consumer confidence. However, some analysts warn of potential inflation risks in the coming quarters.",
      url: `https://${sourceName.toLowerCase().replace(" ", "")}.com/market-recovery-2024`,
      source: sourceName,
      timestamp: new Date(),
    },
  ]

  // Return a subset based on the limit
  return sampleArticles.slice(0, limit).map((article) => ({
    ...article,
    id: Math.random().toString(36).substr(2, 9),
    scraped_at: new Date(),
  }))
}

async function analyzeAndStoreArticle(article: any) {
  try {
    // Analyze article with AI
    const analysisResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/ai/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: article.content,
          options: {
            store_in_mongodb: false, // We'll store manually with additional metadata
            use_vector_search: true,
          },
        }),
      },
    )

    const analysisResult = await analysisResponse.json()

    if (analysisResult.success) {
      // Generate embedding for vector search
      const embedding = await generateEmbedding(article.content)

      // Store in MongoDB with full metadata
      await client.connect()
      const database = client.db("TruthGuard")
      const collection = database.collection("articles")

      const articleDocument = {
        ...article,
        ...analysisResult.analysis,
        embedding,
        bias_score: analysisResult.analysis.bias_analysis?.overall_score || 0,
        misinformation_risk: analysisResult.analysis.misinformation_analysis?.risk_score || 0,
        credibility_score: analysisResult.analysis.credibility_assessment?.overall_score || 0,
        sentiment: analysisResult.analysis.sentiment_analysis?.overall_sentiment || 0,
        topic: analysisResult.analysis.technical_analysis?.key_topics?.[0] || "general",
        word_count: analysisResult.analysis.technical_analysis?.word_count || article.content.split(/\s+/).length,
        processing_model: analysisResult.analysis.model_version || "gemini-1.5-pro",
        scraped_and_analyzed_at: new Date(),
        data_source: "news_scraper",
      }

      const result = await collection.insertOne(articleDocument)

      return {
        success: true,
        data: {
          ...articleDocument,
          _id: result.insertedId,
        },
      }
    }

    throw new Error("Analysis failed")
  } catch (error) {
    console.error("Error analyzing and storing article:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  } finally {
    await client.close()
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text.substring(0, 8000),
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
    return new Array(1536).fill(0)
  }
}
