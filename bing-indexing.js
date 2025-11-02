import "dotenv/config"; // Automatically loads variables from .env
import { parseStringPromise } from "xml2js";

// Read API key from environment
const API_KEY = process.env.BING_API_KEY;
const SITE_URL = "https://freshjuice.dev";

const SITEMAPS = [
  "https://freshjuice.dev/sitemap-core.xml",
  "https://freshjuice.dev/sitemap-blogs.xml",
  "https://freshjuice.dev/sitemap-docs.xml",
];

// Parse one sitemap
async function parseSitemap(sitemapUrl) {
  try {
    const res = await fetch(sitemapUrl);
    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      throw new Error(`${res.status} ${res.statusText} — ${text}`);
    }
    const xml = await res.text();
    const result = await parseStringPromise(xml);
    const urls = result.urlset?.url?.map((entry) => entry.loc[0]) || [];

    console.log(`🔗 ${urls.length} URLs found in ${sitemapUrl}`);
    return urls;
  } catch (error) {
    console.error(`❌ Failed to parse ${sitemapUrl}:`, error.message || error);
    return [];
  }
}

// Submit to Bing
async function submitToBing(urls) {
  if (!API_KEY) {
    console.error("❌ BING_API_KEY is missing. Check your .env file.");
    return;
  }

  if (!urls.length) {
    console.log("⚠️ No URLs to submit to Bing.");
    return;
  }

  try {
    const response = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteUrl: SITE_URL,
          urlList: urls,
        }),
      },
    );

    const text = await response.text().catch(() => "<no body>");
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText} — ${text}`);
    }

    // Try parse JSON, but fall back to raw text
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    console.log(`✅ Bing responded with status: ${response.status}`);
    console.log("🧾 Response body:", body);
  } catch (error) {
    console.error("❌ Bing submission error:", error.message || error);
  }
}

// Main runner
async function run() {
  let allUrls = [];

  for (const sitemap of SITEMAPS) {
    const urls = await parseSitemap(sitemap);
    allUrls = allUrls.concat(urls);
  }

  // Remove duplicates just in case
  allUrls = [...new Set(allUrls)];

  console.log(`🚀 Submitting ${allUrls.length} URLs to Bing...`);
  await submitToBing(allUrls);
}

run().catch(console.error);
