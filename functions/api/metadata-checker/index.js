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
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      "Accept": "text/html"
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
    title: $("title").text() || "",
    description: $("meta[name='description']").attr("content") || "",
    keywords: $("meta[name='keywords']").attr("content") || "",
    author: $("meta[name='author']").attr("content") || "",
    robots: $("meta[name='robots']").attr("content") || "",
    viewport: $("meta[name='viewport']").attr("content") || "",
    generator: $("meta[name='generator']").attr("content") || "",
  };

  const og = {};
  $("meta[property^='og:']").each((index, element) => {
    const property = $(element).attr("property");
    if (property) {
      og[property] = $(element).attr("content");
    }
  });

  const twitter = {};
  $("meta[name^='twitter:']").each((index, element) => {
    const name = $(element).attr("name");
    if (name) {
      twitter[name] = $(element).attr("content");
    }
  });

  // return JSON response
  return new Response(JSON.stringify({ metadata, og, twitter }));
};
