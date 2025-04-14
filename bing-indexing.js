import "dotenv/config"; // Automatically loads variables from .env
import axios from "axios";
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
    const { data: xml } = await axios.get(sitemapUrl);
    const result = await parseStringPromise(xml);
    const urls = result.urlset?.url?.map((entry) => entry.loc[0]) || [];

    console.log(`🔗 ${urls.length} URLs found in ${sitemapUrl}`);
    return urls;
  } catch (error) {
    console.error(`❌ Failed to parse ${sitemapUrl}:`, error.message);
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
    const response = await axios.post(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${API_KEY}`,
      {
        siteUrl: SITE_URL,
        urlList: urls,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`✅ Bing responded with status: ${response.status}`);
    console.log("🧾 Response body:", response.data);
  } catch (error) {
    console.error(
      "❌ Bing submission error:",
      error.response?.data || error.message,
    );
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
