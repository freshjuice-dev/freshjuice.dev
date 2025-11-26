// _js/modules/_errorMessages.js
// Fun, user-friendly error message utilities

// Fun error message prefixes for a friendly user experience
const ERROR_PREFIXES = [
  "Oops! The lemons are too sour",
  "Whoops! Our juice machine got stuck",
  "Uh oh! The fruits fell off the table",
  "Yikes! Someone spilled the juice",
  "Oh no! The blender needs a break",
  "Darn! The oranges rolled away",
  "Oopsie! The recipe got mixed up",
  "Hmm! The juicer needs more fruit",
];

/**
 * Get a random fun error prefix
 * @returns {string} - A random fun error prefix
 */
function getRandomPrefix() {
  return ERROR_PREFIXES[Math.floor(Math.random() * ERROR_PREFIXES.length)];
}

/**
 * Generate a user-friendly error message with optional status code
 * @param {number|null} status - HTTP status code (optional)
 * @param {string} message - Error message or details
 * @returns {string} - User-friendly error message with fun prefix
 */
export function getFriendlyErrorMessage(status, message) {
  const prefix = getRandomPrefix();

  // Handle specific HTTP status codes
  if (status === 400) {
    return `${prefix} — Bad request (400). The URL or request format is invalid.`;
  }
  if (status === 401) {
    return `${prefix} — Unauthorized (401). This page requires authentication.`;
  }
  if (status === 403) {
    return `${prefix} — Access denied (403). The website blocked our request. Try a different URL!`;
  }
  if (status === 404) {
    return `${prefix} — Page not found (404). This URL doesn't seem to exist.`;
  }
  if (status === 408) {
    return `${prefix} — Request timeout (408). The server took too long to respond.`;
  }
  if (status === 429) {
    return `${prefix} — Too many requests (429). Please wait a moment and try again.`;
  }
  if (status === 500) {
    return `${prefix} — Server error (500). The target website is having issues.`;
  }
  if (status === 502) {
    return `${prefix} — Bad gateway (502). The server received an invalid response.`;
  }
  if (status === 503) {
    return `${prefix} — Service unavailable (503). The website is temporarily down.`;
  }
  if (status === 504) {
    return `${prefix} — Gateway timeout (504). The server took too long to respond.`;
  }
  if (status && status >= 400 && status < 500) {
    return `${prefix} — Client error (${status}). Something went wrong with the request.`;
  }
  if (status && status >= 500) {
    return `${prefix} — Server error (${status}). The target website is having issues.`;
  }

  // Handle common error message patterns
  const msg = String(message || "").toLowerCase();
  if (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("failed to fetch")
  ) {
    return `${prefix} — Network error. Check your connection and try again.`;
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return `${prefix} — Request timed out. The website took too long to respond.`;
  }
  if (msg.includes("abort")) {
    return `${prefix} — Request was cancelled. Please try again.`;
  }
  if (msg.includes("cors")) {
    return `${prefix} — Cross-origin error. The website doesn't allow this type of request.`;
  }

  // Fallback with original message if provided
  if (message && message.length > 0 && message.length < 100) {
    return `${prefix} — ${message}`;
  }

  return `${prefix} — Something unexpected happened. Please try again!`;
}
