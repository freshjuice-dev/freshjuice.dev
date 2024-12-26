import axios from "axios";
import * as cheerio from 'cheerio';

export const onRequestGet = async ({ request }) => {
  return new Response(JSON.stringify({
    message: "Method Not Allowed. Please visit https://freshjuice.dev/tools/metadata-checker/"
  }), {
    status: 405
  });
};

export const onRequestPost = async ({ request }) => {
  const { targetUrl } = await request.json();

  const originalHeaders = Object.fromEntries(request.headers.entries());

  const userIP =
    request.headers.get("cf-connecting-ip") || // Cloudflare's header for the client IP
    request.headers.get("x-forwarded-for") || // Proxies may include this header
    null;

  if (userIP) {
    originalHeaders["X-Forwarded-For"] = userIP;
  }

  // Check if the target URL is provided and its URL
  if (!targetUrl || !targetUrl.startsWith("http")) {
    return new Response(JSON.stringify({
      message: "Invalid target URL"
    }), {
      status: 400
    });
  }

  let sourceCode = "Nada";

  // Fetch the target URL source code using Axios
  await axios.get(targetUrl, {
    headers:  {
      ...originalHeaders,
      "user-agent": originalHeaders["user-agent"] || "Mozilla/5.0",
      "accept": "text/html"
    }
  })
    .then((response) => {
      sourceCode = response.data;
    })
    .catch((error) => {
      return new Response(JSON.stringify({
        message: "Failed to fetch the target URL",
        error
      }), {
        status: 500
      });
    });

  // Load the source code into Cheerio
  const $ = cheerio.load(sourceCode);

  // Extract the metadata
  const metadata = {
    title: $("head title").text() || "",
    description: $("head meta[name='description']").attr("content") || "",
    keywords: $("head meta[name='keywords']").attr("content") || "",
    canonical: $("head link[rel='canonical']").attr("href") || "",
    author: $("head meta[name='author']").attr("content") || "",
    robots: $("head meta[name='robots']").attr("content") || "",
    viewport: $("head meta[name='viewport']").attr("content") || "",
    generator: $("head meta[name='generator']").attr("content") || "",
  };

  const og = {};
  $("head meta[property^='og:']").each((index, element) => {
    const property = $(element).attr("property");
    if (property) {
      og[property] = $(element).attr("content");
    }
  });

  const twitter = {};
  $("head meta[name^='twitter:']").each((index, element) => {
    const name = $(element).attr("name");
    if (name) {
      twitter[name] = $(element).attr("content");
    }
  });

  // return JSON response
  return new Response(JSON.stringify({
    homeUrl: new URL(targetUrl).hostname || "",
    metadata,
    og,
    twitter
  }));
};
