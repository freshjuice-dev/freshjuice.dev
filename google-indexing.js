import axios from "axios";
import { google } from "googleapis";
import { parseStringPromise } from "xml2js";
import key from "./.google-service-account.json" assert { type: "json" };

// List of sitemap URLs
const SITEMAPS = [
  "https://freshjuice.dev/sitemap-core.xml",
  "https://freshjuice.dev/sitemap-blogs.xml",
  "https://freshjuice.dev/sitemap-docs.xml",
];

// Create JWT client
const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ["https://www.googleapis.com/auth/indexing"],
  null,
);

// Get access token
async function getAccessToken() {
  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

// Send indexing request
async function sendIndexingRequest(urls, accessToken) {
  for (const url of urls) {
    try {
      const response = await axios.post(
        "https://indexing.googleapis.com/v3/urlNotifications:publish",
        {
          url,
          type: "URL_UPDATED",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log(`✅ Indexed: ${url}`);
    } catch (error) {
      console.error(
        `❌ Error indexing ${url}:`,
        error.response?.data || error.message,
      );
    }
  }
}

// Parse one sitemap
async function parseSitemap(sitemapUrl) {
  try {
    const { data: xml } = await axios.get(sitemapUrl);
    const result = await parseStringPromise(xml);
    const urls = result.urlset?.url?.map((entry) => entry.loc[0]) || [];

    console.log(`🔗 ${urls.length} URLs found in ${sitemapUrl}`);
    return urls;
  } catch (error) {
    console.error(
      `❌ Failed to fetch or parse sitemap: ${sitemapUrl}`,
      error.message,
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
