// _js/modules/sanitize.js

// Remove HTML tags and trim
export function stripTags(input) {
  const s = String(input ?? "");
  // remove all tags
  const noTags = s.replace(/<[^>]*>/g, "");
  // collapse whitespace
  return noTags.replace(/\s+/g, " ").trim();
}

// Allow only http(s) URLs; return "" otherwise
export function allowHttpUrl(s) {
  try {
    const u = new URL(String(s));
    if (u.protocol === "https:") return u.toString();
  } catch {}
  return "";
}
