// app/viral-tracker/page.tsx
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, AlertTriangle } from "lucide-react"
import { connectToDatabase, dbName } from "@/lib/mongodb"
import React from "react"
import { ObjectId } from "mongodb"

// Define a proper type for the article data
interface Article {
    _id: ObjectId
    title: string
    source: string
    url?: string
    published_at?: string
    bias_score?: number
    credibility_score?: number
    misinformation_risk?: number
}

/**
 * Fetches articles with the highest misinformation risk to track potentially viral content.
 * This is a more meaningful query for a "viral tracker" than fetching random articles.
 */
async function getViralArticles(): Promise<Article[]> {
    try {
        const client = await connectToDatabase()
        const db = client.db(dbName)
        const articles = await db
            .collection("articles")
            .find({ misinformation_risk: { $exists: true } })
            .sort({ misinformation_risk: -1 }) // Sort by highest risk
            .limit(15) // Fetch top 15 riskiest articles
            .toArray()

        // The data needs to be serialized to be passed from a Server Component to the browser.
        // JSON.parse(JSON.stringify(...)) is a simple way to handle this for objects like ObjectId and Date.
        return JSON.parse(JSON.stringify(articles))
    } catch (error) {
        console.error("Database Error: Failed to fetch viral articles.", error)
        // In case of an error, return an empty array to prevent the page from crashing.
        return []
    }
}

// Helper function to format risk level and color
const getRiskBadge = (risk: number) => {
    if (risk > 0.7) {
        return (
            <Badge variant="destructive" className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                High Risk
            </Badge>
        )
    }
    if (risk > 0.4) {
        return (
            <Badge variant="secondary" className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Medium Risk
            </Badge>
        )
    }
    return (
        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Low Risk
        </Badge>
    )
}

// The refactored page component
export default async function ViralTrackerPage() {
    const articles = await getViralArticles()

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <TrendingUp className="h-8 w-8 text-red-600" />
                        <div>
                            <h1 className="text-2xl font-bold">Viral Risk Tracker</h1>
                            <p className="text-sm text-gray-600">
                                Monitoring articles with the highest potential for spreading misinformation.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Top At-Risk Articles</CardTitle>
                        <CardDescription>
                            A real-time list of articles sorted by their misinformation risk score.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {articles.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Article Title</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead className="text-center">Bias</TableHead>
                                        <TableHead className="text-center">Credibility</TableHead>
                                        <TableHead className="text-center">Misinformation Risk</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {articles.map((article) => (
                                        <TableRow key={article._id.toString()}>
                                            <TableCell className="font-medium">
                                                <a
                                                    href={article.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    {article.title}
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{article.source}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {article.bias_score !== undefined
                                                    ? `${(article.bias_score * 100).toFixed(0)}%`
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {article.credibility_score !== undefined
                                                    ? `${(article.credibility_score * 100).toFixed(0)}%`
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getRiskBadge(article.misinformation_risk || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>No articles with misinformation risk found at the moment.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}