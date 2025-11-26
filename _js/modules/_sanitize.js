// _js/modules/_sanitize.js
// Input sanitization and cleanup utilities

/**
 * Remove HTML tags and normalize whitespace
 * @param {*} input - Input to sanitize
 * @returns {string} - Sanitized string with tags removed
 */
export function stripTags(input) {
  const s = String(input ?? "");
  // remove all tags
  const noTags = s.replace(/<[^>]*>/g, "");
  // collapse whitespace
  return noTags.replace(/\s+/g, " ").trim();
}

/**
 * Validate and return HTTPS URL only; returns "" for invalid or non-HTTPS URLs
 * @param {string} s - URL string to validate
 * @returns {string} - Valid HTTPS URL or empty string
 */
export function allowHttpUrl(s) {
  try {
    const u = new URL(String(s));
    if (u.protocol === "https:") return u.toString();
  } catch {
    // Invalid URL
  }
  return "";
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string safe for HTML output
 */
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sanitize a string for use in URLs (basic cleanup)
 * @param {string} str - String to sanitize
 * @returns {string} - URL-safe string
 */
export function sanitizeForUrl(str) {
  return stripTags(str)
    .replace(/[^\w\s-]/g, "")
    .trim();
}
