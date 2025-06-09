// components/recent-articles.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, AlertTriangle, CheckCircle } from "lucide-react"

interface Article {
  _id: string; // MongoDB ObjectId
  title: string;
  source: string;
  bias_score: number;
  misinformation_risk?: number; // Optional, might not always be present
  timestamp: string; // ISO string
  topic?: string;
  url?: string;
}

interface RecentArticlesProps {
  articles: Article[] | null;
}

export function RecentArticles({ articles }: RecentArticlesProps) {
  const getBiasColor = (score: number) => {
    if (score < 0.3) return "bg-green-100 text-green-800"
    if (score < 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getRiskColor = (score: number) => {
    if (score < 0.2) return "bg-green-100 text-green-800"
    if (score < 0.5) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getBiasLabel = (score: number) => {
    if (score < 0.3) return "Low"
    if (score < 0.6) return "Moderate"
    return "High"
  }

  const getRiskLabel = (score: number) => {
    if (score < 0.2) return "Low"
    if (score < 0.5) return "Medium"
    return "High"
  }

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const displayedArticles = articles || [];

  return (
      <div className="space-y-4">
        {displayedArticles.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No recent articles to display.</div>
        ) : (
            displayedArticles.map((article) => (
                <div key={article._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{article.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{article.source}</span>
                      <span>{formatTimeAgo(article.timestamp)}</span>
                      <div className="flex items-center space-x-2">
                        <Badge className={getBiasColor(article.bias_score)}>Bias: {getBiasLabel(article.bias_score)}</Badge>
                        <Badge className={getRiskColor(article.misinformation_risk || 0.1)}>
                          Risk: {getRiskLabel(article.misinformation_risk || 0.1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(article.misinformation_risk || 0) > 0.5 ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {article.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                    )}
                  </div>
                </div>
            ))
        )}
      </div>
  )
}