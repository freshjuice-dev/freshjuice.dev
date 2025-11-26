// _js/modules/_blockedDomains.js
// AI platform domain blocking utilities

// Blocked AI platform domains
// Matches exact domain OR any subdomain (e.g., "sora.chatgpt.com" matches "chatgpt.com")
// Note: Only specific Google AI subdomains are blocked, not all of google.com
export const AI_PLATFORM_DOMAINS = [
  // OpenAI
  "chatgpt.com",
  "openai.com",
  // Anthropic
  "claude.ai",
  "anthropic.com",
  // Google AI (specific subdomains only)
  "gemini.google.com",
  "bard.google.com",
  "aistudio.google.com",
  // Microsoft
  "copilot.microsoft.com",
  // Other AI platforms
  "perplexity.ai",
  "character.ai",
  "poe.com",
  "you.com",
  "pi.ai",
  "deepseek.com",
  "mistral.ai",
  "cohere.com",
  "together.ai",
  "huggingface.co",
];

// Error message for blocked AI platforms
export const AI_PLATFORM_ERROR_MESSAGE =
  "AI chatbot platforms (ChatGPT, Claude, Gemini, etc.) cannot be analyzed. These URLs require authentication and return dynamic content. Please provide a standard website URL.";

/**
 * Check if a hostname belongs to a blocked AI platform
 * @param {string} hostname - The hostname to check (e.g., "chat.openai.com", "claude.ai")
 * @returns {boolean} - True if the hostname is a blocked AI platform
 */
export function isAIPlatformDomain(hostname) {
  if (!hostname) return false;

  const h = String(hostname).toLowerCase().trim();
  if (!h) return false;

  for (const blocked of AI_PLATFORM_DOMAINS) {
    // Exact match
    if (h === blocked) return true;
    // Subdomain match (e.g., "sora.chatgpt.com" ends with ".chatgpt.com")
    if (h.endsWith("." + blocked)) return true;
  }

  return false;
}

/**
 * Check if a URL belongs to a blocked AI platform
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is a blocked AI platform
 */
export function isAIPlatformUrl(url) {
  try {
    const u = new URL(String(url));
    return isAIPlatformDomain(u.hostname);
  } catch {
    return false;
  }
}
