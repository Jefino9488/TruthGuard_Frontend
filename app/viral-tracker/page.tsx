// app/viral-tracker/page.tsx
import { connectToDatabase, dbName } from "@/lib/mongodb";
import React from "react";

export default async function ViralTrackerPage() {
  // Example: Fetch the first 5 articles from a 'articles' collection
  let articles: any[] = [];
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    articles = await db.collection("articles").find({}).limit(5).toArray();
  } catch (err) {
    return <div>Error loading viral tracker data: {String(err)}</div>;
  }

  return (
    <div>
      <h1>Viral Tracker</h1>
      <ul>
        {articles.length === 0 && <li>No articles found.</li>}
        {articles.map((article) => (
          <li key={article._id?.toString() || article.title}>
            <strong>{article.title}</strong> — {article.source}
          </li>
        ))}
      </ul>
    </div>
  );
}