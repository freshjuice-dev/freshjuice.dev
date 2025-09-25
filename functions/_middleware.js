// functions/_middleware.js
export async function onRequest({ request, next }) {
  let response = await next();

  const origin = request.headers.get("Origin") || "";
  const allowlist = ["https://freshjuice.dev", "https://demo.freshjuice.dev"];

  if (origin && allowlist.includes(origin)) {
    response = new Response(response.body, response);
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
    response.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "*");
    response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  }

  return response;
}
