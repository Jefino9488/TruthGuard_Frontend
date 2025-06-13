import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, dbName } from "@/lib/mongodb";

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
                    const client = await connectToDatabase();
                    const db = client.db(dbName);

                    // Fetch latest data from MongoDB collections
                    const [articles, analytics, alerts] = await Promise.all([
                        db.collection("articles").find({}).sort({ analyzed_at: -1 }).limit(5).toArray(),
                        db.collection("dashboard-analytics").find({}).toArray(),
                        db.collection("articles").find({ min_score: 0.7 }).limit(3).toArray(),
                    ]);

                    const systemStats = analytics[0] || {};
                    const recentArticles = articles || [];
                    const activeAlerts = alerts?.map((article: any) => ({
                        ...article,
                        alert_type: "high_bias", // Simplified alert type
                        severity: "high",
                    })) || [];


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
                                high_risk_count: analyticsData.data?.overall_metrics?.high_risk_count || 0,
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
                            bias_detected: analyticsData.data?.biasDistribution?.reduce((sum: number, b: any) => sum + b.count, 0) || 0,
                            misinformation_flagged: analyticsData.data?.overall_metrics?.high_risk_count || 0,
                            high_credibility: analyticsData.data?.biasDistribution?.filter((b: any) => b._id === 1.0)?.[0]?.count || 0, // Simplified high credibility count
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
                    const vectorUpdate = {
                        type: "vector_search_activity",
                        data: recentArticles.slice(0, Math.min(recentArticles.length, 3)), // Use recent articles for vector search activity
                        timestamp: new Date().toISOString(),
                    };
                    const vectorData = `data: ${JSON.stringify(vectorUpdate)}\n\n`;
                    controller.enqueue(encoder.encode(vectorData));

                } catch (error) {
                    console.error("Real-time update error:", error);

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