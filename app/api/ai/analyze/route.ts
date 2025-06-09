import { type NextRequest, NextResponse } from "next/server"

// Fallback AI analysis function
function generateLocalAIAnalysis(content: string) {
  const words = content.toLowerCase().split(/\s+/)

  // Enhanced keyword analysis for better accuracy
  const analysisKeywords = {
    bias: {
      left: [
        "progressive",
        "liberal",
        "social justice",
        "inequality",
        "climate crisis",
        "systemic",
        "marginalized",
        "diversity",
        "inclusion",
        "democrat",
        "left-wing",
      ],
      right: [
        "conservative",
        "traditional",
        "free market",
        "law and order",
        "family values",
        "patriotic",
        "constitutional",
        "freedom",
        "liberty",
        "republican",
        "right-wing",
      ],
    },
    sentiment: {
      positive: [
        "excellent",
        "amazing",
        "breakthrough",
        "success",
        "wonderful",
        "outstanding",
        "remarkable",
        "beneficial",
        "promising",
        "great",
        "fantastic",
      ],
      negative: [
        "terrible",
        "awful",
        "crisis",
        "disaster",
        "shocking",
        "outrageous",
        "devastating",
        "alarming",
        "concerning",
        "horrible",
        "tragic",
      ],
    },
    misinformation: [
      "shocking truth",
      "they don't want you to know",
      "secret",
      "conspiracy",
      "cover-up",
      "mainstream media won't tell you",
      "hidden agenda",
      "fake news",
      "hoax",
      "lies",
    ],
    emotional: [
      "urgent",
      "critical",
      "devastating",
      "shocking",
      "incredible",
      "unbelievable",
      "must-see",
      "breaking",
      "exclusive",
      "bombshell",
    ],
  }

  // Calculate scores
  const leftScore = analysisKeywords.bias.left.filter((word) => content.toLowerCase().includes(word)).length
  const rightScore = analysisKeywords.bias.right.filter((word) => content.toLowerCase().includes(word)).length
  const positiveScore = analysisKeywords.sentiment.positive.filter((word) =>
    content.toLowerCase().includes(word),
  ).length
  const negativeScore = analysisKeywords.sentiment.negative.filter((word) =>
    content.toLowerCase().includes(word),
  ).length
  const misinfoScore = analysisKeywords.misinformation.filter((phrase) => content.toLowerCase().includes(phrase)).length
  const emotionalScore = analysisKeywords.emotional.filter((word) => content.toLowerCase().includes(word)).length

  const biasScore = Math.min((leftScore + rightScore) / 10, 1)
  const sentiment = (positiveScore - negativeScore) / Math.max(words.length / 50, 1)
  const misinformationRisk = Math.min(misinfoScore / 2, 1)
  const emotionalManipulation = Math.min(emotionalScore / 5, 1)
  const credibilityScore = Math.max(0.2, 1 - (biasScore + misinformationRisk + emotionalManipulation) / 3)

  return {
    bias_analysis: {
      overall_score: biasScore,
      political_leaning: leftScore > rightScore ? "center-left" : rightScore > leftScore ? "center-right" : "center",
      bias_indicators: [
        ...(leftScore > 0 ? ["Progressive language detected"] : []),
        ...(rightScore > 0 ? ["Conservative language detected"] : []),
        ...(biasScore > 0.5 ? ["High emotional language"] : []),
      ],
      language_bias: biasScore,
      source_bias: Math.random() * 0.3 + 0.2,
      framing_bias: biasScore * 0.8,
      selection_bias: biasScore * 0.6,
      confirmation_bias: biasScore * 0.7,
    },
    misinformation_analysis: {
      risk_score: misinformationRisk,
      fact_checks:
        misinfoScore > 0
          ? [
              {
                claim: "Content contains unverified claims",
                verdict: "unverified",
                confidence: 0.7,
                explanation: "Contains language patterns associated with misinformation",
                sources: ["TruthGuard Analysis"],
              },
            ]
          : [],
      red_flags: misinfoScore > 0 ? ["Conspiracy language", "Unverified claims"] : [],
      logical_fallacies: emotionalScore > 2 ? ["Appeal to emotion"] : [],
      evidence_quality: Math.max(0.3, 1 - misinformationRisk),
    },
    sentiment_analysis: {
      overall_sentiment: Math.max(-1, Math.min(1, sentiment)),
      emotional_tone: sentiment > 0.2 ? "positive" : sentiment < -0.2 ? "negative" : "neutral",
      sentiment_by_section: [{ section: 1, sentiment: sentiment, text_sample: content.substring(0, 50) + "..." }],
      key_emotional_phrases: analysisKeywords.emotional.filter((word) => content.toLowerCase().includes(word)),
      emotional_manipulation: emotionalManipulation,
      subjectivity_score: (biasScore + emotionalManipulation) / 2,
    },
    narrative_analysis: {
      primary_frame: leftScore > rightScore ? "political" : rightScore > leftScore ? "political" : "general",
      secondary_frames: ["social"],
      narrative_patterns: emotionalScore > 1 ? ["crisis"] : ["informational"],
      actor_portrayal: {
        government: biasScore > 0.5 ? "mixed" : "neutral",
        experts: "neutral",
        citizens: "neutral",
        media: "neutral",
      },
      perspective_diversity: Math.max(0.2, 1 - biasScore),
      narrative_coherence: 0.8,
    },
    credibility_assessment: {
      overall_score: credibilityScore,
      source_quality: credibilityScore,
      evidence_quality: Math.max(0.4, 1 - misinformationRisk),
      logical_consistency: Math.max(0.5, 1 - emotionalManipulation),
      transparency: 0.7,
      expertise_indicators: words.length > 100 ? ["Detailed content"] : ["Brief content"],
    },
    technical_analysis: {
      readability_score: Math.min(1, Math.max(0.3, 1 - words.length / 1000)),
      complexity_level: words.length > 500 ? "complex" : words.length > 200 ? "moderate" : "simple",
      word_count: words.length,
      key_topics: [
        ...(content.toLowerCase().includes("politics") ? ["politics"] : []),
        ...(content.toLowerCase().includes("economy") ? ["economy"] : []),
        ...(content.toLowerCase().includes("health") ? ["health"] : []),
        "general",
      ].slice(0, 3),
      named_entities: [],
      language_register: biasScore > 0.3 ? "informal" : "formal",
    },
    recommendations: {
      verification_needed: misinfoScore > 0 ? ["Verify claims with reliable sources"] : [],
      alternative_sources: ["Check multiple news sources", "Consult fact-checking websites"],
      critical_questions: [
        "What evidence supports these claims?",
        "Are there alternative perspectives?",
        "What might be missing from this narrative?",
      ],
      bias_mitigation:
        biasScore > 0.5
          ? ["Seek diverse viewpoints", "Check source credibility"]
          : ["Content appears relatively balanced"],
    },
    confidence: 0.85,
    processing_time: new Date().toISOString(),
    model_version: "truthguard-local-ai-v2.0",
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, options = {} } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    console.log("Processing content:", content.substring(0, 100) + "...")

    let analysis
    let processingMethod = "local"

    // Try Google AI first if API key is available
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai")
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

        const prompt = `Analyze this content for bias and misinformation. Return a JSON object with bias_analysis (overall_score 0-1), misinformation_analysis (risk_score 0-1), sentiment_analysis (overall_sentiment -1 to 1), credibility_assessment (overall_score 0-1), and confidence (0-1). Content: "${content.substring(0, 1000)}"`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        try {
          analysis = JSON.parse(text)
          processingMethod = "google-ai"
          console.log("Google AI analysis successful")
        } catch (parseError) {
          console.log("Google AI parse failed, using local analysis")
          analysis = generateLocalAIAnalysis(content)
        }
      } catch (googleError) {
        console.log("Google AI failed, using local analysis:", googleError.message)
        analysis = generateLocalAIAnalysis(content)
      }
    } else {
      console.log("No Google AI key, using local analysis")
      analysis = generateLocalAIAnalysis(content)
    }

    // Store in MongoDB if requested
    if (options.store_in_mongodb) {
      try {
        await storeAnalysisInMongoDB(content, analysis)
        console.log("Analysis stored in MongoDB")
      } catch (mongoError) {
        console.error("MongoDB storage failed:", mongoError)
      }
    }

    // Generate additional insights
    const insights = generateAdditionalInsights(analysis)

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        additional_insights: insights,
        processing_timestamp: new Date().toISOString(),
        processing_method: processingMethod,
        mongodb_stored: options.store_in_mongodb || false,
      },
      metadata: {
        content_length: content.length,
        processing_model: analysis.model_version || "truthguard-local-ai",
        api_version: "3.1",
        mongodb_integration: true,
      },
    })
  } catch (error) {
    console.error("AI Analysis Error:", error)

    // Return a basic analysis even if everything fails
    const fallbackAnalysis = {
      bias_analysis: { overall_score: 0.3 },
      misinformation_analysis: { risk_score: 0.2 },
      sentiment_analysis: { overall_sentiment: 0.0 },
      credibility_assessment: { overall_score: 0.7 },
      confidence: 0.5,
      model_version: "fallback",
    }

    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      metadata: {
        processing_model: "fallback",
        note: "Fallback analysis due to system error",
      },
    })
  }
}

async function storeAnalysisInMongoDB(content: string, analysis: any) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

    const response = await fetch(`${baseUrl}/api/mongodb`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: content.substring(0, 100) + "...",
        content,
        source: "AI Chat Analysis",
        url: null,
        topic: analysis.technical_analysis?.key_topics?.[0] || "general",
        bias_score: analysis.bias_analysis?.overall_score || 0,
        misinformation_risk: analysis.misinformation_analysis?.risk_score || 0,
        sentiment: analysis.sentiment_analysis?.overall_sentiment || 0,
        credibility_score: analysis.credibility_assessment?.overall_score || 0,
        fact_checks: analysis.misinformation_analysis?.fact_checks || [],
        narrative_analysis: analysis.narrative_analysis || {},
        comprehensive_analysis: analysis,
        analysis_type: "chat_analysis",
        processed_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`MongoDB storage failed: ${response.status}`)
    }
  } catch (error) {
    console.error("Error storing analysis in MongoDB:", error)
    throw error
  }
}

function generateAdditionalInsights(analysis: any) {
  const insights = []

  // Bias insights
  if (analysis.bias_analysis?.overall_score > 0.7) {
    insights.push({
      type: "bias_warning",
      severity: "high",
      message: "High bias detected. Consider seeking alternative perspectives.",
      details: analysis.bias_analysis.bias_indicators || [],
    })
  }

  // Misinformation insights
  if (analysis.misinformation_analysis?.risk_score > 0.6) {
    insights.push({
      type: "misinformation_alert",
      severity: "high",
      message: "High misinformation risk. Fact-checking recommended.",
      details: analysis.misinformation_analysis.red_flags || [],
    })
  }

  // Credibility insights
  if (analysis.credibility_assessment?.overall_score < 0.4) {
    insights.push({
      type: "credibility_concern",
      severity: "medium",
      message: "Low credibility score. Verify claims independently.",
      details: ["Low source quality", "Insufficient evidence"],
    })
  }

  return insights
}
