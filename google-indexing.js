import "dotenv/config"; // Automatically loads variables from .env
import { google } from "googleapis";
import { parseStringPromise } from "xml2js";

function normalizeGooglePrivateKey(raw) {
  if (!raw) return "";
  // Remove surrounding quotes if present and convert \n to real newlines
  return raw
    .replace(/^"(.*)"$/s, "$1")
    .replace(/\\n/g, "\n")
    .trim();
}

const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || "";
const PRIVATE_KEY = normalizeGooglePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

// List of sitemap URLs
const SITEMAPS = [
  "https://freshjuice.dev/sitemap-tools.xml",
  "https://freshjuice.dev/sitemap-core.xml",
  "https://freshjuice.dev/sitemap-blogs.xml",
  "https://freshjuice.dev/sitemap-docs.xml",
];

// Create JWT client
const jwtClient = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/indexing"],
});

// Get access token
async function getAccessToken() {
  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

// Send indexing request
async function sendIndexingRequest(urls, accessToken) {
  for (const url of urls) {
    try {
      const response = await fetch(
        "https://indexing.googleapis.com/v3/urlNotifications:publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ url, type: "URL_UPDATED" }),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "<no body>");
        throw new Error(`${response.status} ${response.statusText} — ${text}`);
      }

      console.log(`✅ Indexed: ${url}`);
    } catch (error) {
      console.error(`❌ Error indexing ${url}:`, error.message || error);
    }
  }
}

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
    console.error(
      `❌ Failed to fetch or parse sitemap: ${sitemapUrl}`,
      error.message || error,
    );
    return [];
  }
}

// Main function
async function run() {
  const accessToken = await getAccessToken();

  let allUrls = [];

  for (const sitemap of SITEMAPS) {
    const urls = await parseSitemap(sitemap);
    allUrls = allUrls.concat(urls);
  }

  console.log(`🚀 Sending ${allUrls.length} URLs to Google Indexing API...`);
  await sendIndexingRequest(allUrls, accessToken);
  console.log("✅ Done!");
}

run().catch(console.error);
