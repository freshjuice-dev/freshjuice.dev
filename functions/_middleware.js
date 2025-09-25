// functions/_middleware.js
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";

  const allowlist = new Set([
    "https://freshjuice.dev",
    "https://demo.freshjuice.dev",
  ]);

  const isAsset =
    /\.(?:css|js|map|png|jpe?g|gif|webp|svg|ico|avif|woff2?|ttf|otf|mp4|webm|json|webmanifest)$/i.test(
      url.pathname,
    );

  const isPreflight = request.method === "OPTIONS" && origin;

  const withCors = (res) => {
    const out = new Response(res ? res.body : null, res || { status: 204 });

    out.headers.set("Vary", "Origin");

    if (allowlist.has(origin)) {
      out.headers.set("Access-Control-Allow-Origin", origin);
      out.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      // Берём запрошенные заголовки, иначе '*'
      out.headers.set(
        "Access-Control-Allow-Headers",
        request.headers.get("Access-Control-Request-Headers") || "*",
      );
      out.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
      out.headers.set("Timing-Allow-Origin", "*");
    }
    return out;
  };

  try {
    if (isPreflight) {
      return withCors(null); // 204 No Content + CORS
    }

    if (isAsset) {
      const res = await next();
      return origin ? withCors(res) : res;
    }

    const res = await next();
    return res;
  } catch (err) {
    return new Response("Internal error", { status: 500 });
  }
}
