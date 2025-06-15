import { type NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom"; // Keep JSDOM if this route still performs direct scraping/parsing

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

// This frontend API route will now primarily trigger the backend's scraping
// and potentially fetch recent articles from the backend after a delay.
export async function POST(request: NextRequest) {
  try {
    const { urls, auto_scrape = false } = await request.json();

    // The backend's /scrape endpoint doesn't accept specific URLs to scrape.
    // It runs its own internal scraping logic (CATEGORIES and TOPICS).
    // So, 'urls' parameter from frontend will be ignored for backend triggering.
    // 'auto_scrape' implies triggering the backend's full scrape process.

    if (!auto_scrape && (!urls || urls.length === 0)) {
      return NextResponse.json({ error: "Either 'auto_scrape' must be true or 'urls' array must be provided for direct scraping (if this frontend still supports it)." }, { status: 400 });
    }

    // Trigger backend's scraping process
    const backendTriggerResponse = await fetch(`${BACKEND_BASE_URL}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Backend /scrape does not take specific parameters
    });

    if (!backendTriggerResponse.ok) {
      const errorData = await backendTriggerResponse.json();
      throw new Error(`Failed to trigger backend scraping: ${errorData.error || backendTriggerResponse.statusText}`);
    }

    const backendTriggerResult = await backendTriggerResponse.json();

    // After triggering, you might want to fetch recent articles from backend after a short delay
    // to show results, as the backend's /scrape is asynchronous.
    // For this example, we'll return a message that it was triggered.
    // A more complete solution would involve real-time updates or a separate fetch after a delay.
    return NextResponse.json({
      success: true,
      message: backendTriggerResult.message || "Backend scraping initiated successfully.",
      summary: {
        sources_processed: 0, // Unknown from backend trigger
        successful_sources: 0, // Unknown
        total_articles_found: 0, // Unknown
        processing_time: new Date().toISOString(),
      },
      note: "Results will appear in the dashboard/real-time feed as backend processes them.",
    });

  } catch (error: any) {
    console.error("Scraper Error (Frontend Route):", error);
    return NextResponse.json(
        {
          success: false,
          error: "Scraping failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
    );
  }
}

// These helper functions (scrapeNewsSource, extractArticleLinks, scrapeArticle, etc.)
// are likely no longer needed if the backend fully handles scraping.
// They are kept here for completeness of original file, but logic above ignores them.
// If your frontend still needs to do *some* direct scraping not handled by backend,
// then these would remain and be used in the POST body above.

async function scrapeNewsSource(sourceUrl: string) {
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
      },
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const articles = [];
    const articleLinks = extractArticleLinks(document, sourceUrl);

    for (const link of articleLinks.slice(0, 5)) {
      try {
        const article = await scrapeArticle(link.url);
        if (article) {
          articles.push({
            ...article,
            source: extractSourceName(sourceUrl),
            source_url: sourceUrl,
            headline_from_listing: link.title,
          });
        }
      } catch (error) {
        console.error(`Failed to scrape article ${link.url}:`, error);
      }
    }

    return articles;
  } catch (error) {
    console.error(`Error scraping source ${sourceUrl}:`, error);
    return [];
  }
}

function extractArticleLinks(document: Document, baseUrl: string) {
  const links = [];

  const selectors = [
    'a[href*="/article/"]',
    'a[href*="/story/"]',
    'a[href*="/news/"]',
    'a[href*="/politics/"]',
    'a[href*="/world/"]',
    "h1 a",
    "h2 a",
    "h3 a",
    ".headline a",
    ".story-headline a",
    '[data-testid="card-headline"] a',
  ];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);

    for (const element of elements) {
      const href = element.getAttribute("href");
      const title = element.textContent?.trim();

      if (href && title && title.length > 10) {
        let fullUrl = href;

        if (!href.startsWith("http")) {
          try {
            fullUrl = new URL(href, baseUrl).toString();
          } catch {
            continue;
          }
        }

        if (
            !links.some((l) => l.url === fullUrl) &&
            !href.includes("#") &&
            !href.includes("mailto:") &&
            !href.includes("javascript:")
        ) {
          links.push({ url: fullUrl, title });
        }
      }
    }
  }

  return links;
}

async function scrapeArticle(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 20000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const title = extractTitle(document);
    const content = extractContent(document);
    const author = extractAuthor(document);
    const publishDate = extractPublishDate(document);

    if (!title || !content || content.length < 100) {
      throw new Error("Insufficient content extracted");
    }

    return {
      title,
      content,
      author,
      publish_date: publishDate,
      url,
      scraped_at: new Date().toISOString(),
      content_length: content.length,
      word_count: content.split(/\s+/).length,
    };
  } catch (error) {
    console.error(`Error scraping article ${url}:`, error);
    return null;
  }
}

function extractTitle(document: Document): string {
  const selectors = [
    "h1",
    '[data-testid="headline"]',
    ".headline",
    ".article-title",
    ".entry-title",
    "title",
    '[property="og:title"]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      return element.textContent.trim();
    }
  }

  return "Untitled Article";
}

function extractContent(document: Document): string {
  const selectors = [
    "article",
    ".article-body",
    ".story-body",
    ".post-content",
    ".entry-content",
    '[data-testid="article-body"]',
    ".content",
    ".article-content",
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      const content = element.textContent
          .trim()
          .replace(/\s+/g, " ")
          .replace(/\n\s*\n/g, "\n\n");

      if (content.length > 200) {
        return content;
      }
    }
  }

  const paragraphs = Array.from(document.querySelectorAll("p"));
  const content = paragraphs
      .map((p) => p.textContent?.trim())
      .filter((text) => text && text.length > 30)
      .join("\n\n");

  return content || "Content could not be extracted";
}

function extractAuthor(document: Document): string {
  const selectors = ['[rel="author"]', ".author", ".byline", '[data-testid="author"]', ".article-author"];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      return element.textContent.trim();
    }
  }

  return "Unknown Author";
}

function extractPublishDate(document: Document): string {
  const selectors = [
    '[property="article:published_time"]',
    '[name="publish_date"]',
    ".publish-date",
    ".article-date",
    "time[datetime]",
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const dateValue =
        element?.getAttribute("content") || element?.getAttribute("datetime") || element?.textContent?.trim();

    if (dateValue) {
      try {
        return new Date(dateValue).toISOString();
      } catch {
        continue;
      }
    }
  }

  return new Date().toISOString();
}

function extractSourceName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "");

    const sourceMap: { [key: string]: string } = {
      "reuters.com": "Reuters",
      "apnews.com": "Associated Press",
      "bbc.com": "BBC",
      "cnn.com": "CNN",
      "foxnews.com": "Fox News",
      "npr.org": "NPR",
      "washingtonpost.com": "Washington Post",
      "nytimes.com": "New York Times",
      "wsj.com": "Wall Street Journal",
      "theguardian.com": "The Guardian",
    };

    return sourceMap[domain] || domain;
  } catch {
    return "Unknown Source";
  }
}