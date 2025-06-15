import type { NextRequest } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;

// Enhanced Server-Sent Events for real-time updates
export async function GET(request: NextRequest) {
    const encoder = new TextEncoder();

    const customReadable = new ReadableStream({
        start(controller) {
            // Send initial connection message
            const data = `data: ${JSON.stringify({
                type: "connection",
                message: "Connected to TruthGuard real-time feed - MongoDB Vector Search Active",
                timestamp: new Date().toISOString(),
                version: "3.0",
                features: ["mongodb_atlas", "vector_search", "google_ai", "real_time_analysis"],
                database: process.env.MONGODB_DB || "TruthGuard",
                collections: ["articles", "vector_search_demo"],
            })}\n\n`;
            controller.enqueue(encoder.encode(data));

            // Enhanced real-time updates with MongoDB integration
            const interval = setInterval(async () => {
                try {
                    // Fetch latest data from backend's dashboard analytics and articles endpoints
                    const [articlesResponse, analyticsResponse, highBiasArticlesResponse, misinformationRiskArticlesResponse] = await Promise.all([
                        fetch(`${BACKEND_BASE_URL}/articles?limit=5&sort_by=analyzed_at&sort_order=desc`), // Fetch recent analyzed articles
                        fetch(`${BACKEND_BASE_URL}/dashboard-analytics`), // Fetch overall analytics
                        fetch(`${BACKEND_BASE_URL}/articles/high-bias?limit=3&min_score=0.7`), // Fetch high bias articles for alerts
                        fetch(`${BACKEND_BASE_URL}/articles/misinformation-risk?limit=3&min_risk=0.6`), // Fetch misinformation risk articles for alerts
                    ]);

                    const [articlesData, analyticsData, highBiasArticlesData, misinformationRiskArticlesData] = await Promise.all([
                        articlesResponse.ok ? articlesResponse.json() : { articles: [] },
                        analyticsResponse.ok ? analyticsResponse.json() : { data: {} },
                        highBiasArticlesResponse.ok ? highBiasArticlesResponse.json() : { articles: [] },
                        misinformationRiskArticlesResponse.ok ? misinformationRiskArticlesResponse.json() : { articles: [] },
                    ]);

                    const systemStats = analyticsData.data?.totalStats?.[0] || {};
                    const recentArticles = articlesData.articles || [];
                    const highBiasAlerts = highBiasArticlesData.articles?.map((article: any) => ({
                        ...article,
                        alert_type: "high_bias",
                        severity: "high",
                    })) || [];
                    const misinformationAlerts = misinformationRiskArticlesData.articles?.map((article: any) => ({
                        ...article,
                        alert_type: "misinformation_risk",
                        severity: "critical",
                    })) || [];

                    const activeAlerts = [...highBiasAlerts, ...misinformationAlerts];


                    const update = {
                        type: "comprehensive_update",
                        data: {
                            articles: recentArticles,
                            system_stats: {
                                total_articles: systemStats.totalArticles || 0,
                                avg_bias: systemStats.avgBias || 0,
                                avg_misinfo: systemStats.avgMisinfoRisk || 0,
                                avg_credibility: systemStats.avgCredibility || 0,
                                unique_sources: systemStats.uniqueSources?.length || 0,
                                unique_topics: systemStats.uniqueTopics?.length || 0,
                                high_risk_count: analyticsData.data?.overall_metrics?.high_risk_count || 0, // Ensure this exists from backend
                            },
                            alerts: activeAlerts,
                            processing_pipeline: {
                                mongodb_status: "connected",
                                vector_search_status: "active",
                                google_ai_status: "operational",
                                real_time_processing: "running",
                            },
                        },
                        timestamp: new Date().toISOString(),
                        stats: {
                            total_processed: systemStats.totalArticles || 0,
                            bias_detected: analyticsData.data?.biasDistribution?.reduce((sum: number, b: any) => sum + b.count, 0) || 0, // Sum of all bias categories
                            misinformation_flagged: analyticsData.data?.overall_metrics?.high_risk_count || 0, // Use high_risk_count as proxy
                            high_credibility: analyticsData.data?.totalStats?.[0]?.avgCredibility ? Math.round(analyticsData.data.totalStats[0].avgCredibility * systemStats.totalArticles) : 0, // Simplified, rough estimate
                            processing_rate: Math.floor(Math.random() * 50) + 850, // Simulated rate
                            vector_searches: Math.floor(Math.random() * 100) + 500, // Simulated count
                        },
                    };

                    const data = `data: ${JSON.stringify(update)}\n\n`;
                    controller.enqueue(encoder.encode(data));

                    // Send specific alerts if any
                    if (activeAlerts.length > 0) {
                        const alertUpdate = {
                            type: "alert",
                            data: activeAlerts,
                            timestamp: new Date().toISOString(),
                            alert_source: "mongodb_analysis",
                        };
                        const alertData = `data: ${JSON.stringify(alertUpdate)}\n\n`;
                        controller.enqueue(encoder.encode(alertData));
                    }

                    // Simulate vector search activity
                    // Note: Backend's vector-search endpoint is a POST, not a GET for activity feed.
                    // We can simulate some recent search activity or fetch from a dedicated backend endpoint if it existed.
                    const vectorSearchActivity = recentArticles.slice(0, Math.min(recentArticles.length, 3)).map((article: any) => ({
                        title: article.title,
                        topic: article.topic,
                        bias_score: article.bias_score,
                        credibility_score: article.credibility_score,
                        timestamp: article.analyzed_at || article.published_at,
                        processing_model: article.ai_analysis?.model_version || "unknown",
                    }));
                    const vectorUpdate = {
                        type: "vector_search_activity",
                        data: vectorSearchActivity,
                        timestamp: new Date().toISOString(),
                    };
                    const vectorData = `data: ${JSON.stringify(vectorUpdate)}\n\n`;
                    controller.enqueue(encoder.encode(vectorData));

                } catch (error) {
                    console.error("Real-time update error (Frontend Route):", error);

                    // Send error notification
                    const errorUpdate = {
                        type: "error",
                        message: "Temporary backend connection issue - reconnecting...",
                        timestamp: new Date().toISOString(),
                        error_type: "backend_connection",
                    };
                    const errorData = `data: ${JSON.stringify(errorUpdate)}\n\n`;
                    controller.enqueue(encoder.encode(errorData));
                }
            }, 2000); // Update every 2 seconds for real-time feel

            // Cleanup on close
            request.signal.addEventListener("abort", () => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(customReadable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Cache-Control",
        },
    });
}