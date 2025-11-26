/* global Alpine */
import debugLog from "../modules/_debugLog";
import {
  isAIPlatformUrl,
  AI_PLATFORM_ERROR_MESSAGE,
} from "../modules/_blockedDomains";
import { getFriendlyErrorMessage } from "../modules/_errorMessages";

document.addEventListener("alpine:init", () => {
  Alpine.data("robotstxtAnalyzer", () => ({
    // Input state
    inputMode: "url", // 'text' or 'url'
    robotsText: "",
    robotsUrl: "",

    // UI state
    isLoading: false,
    error: null,
    results: null,

    // API endpoint
    apiEndpoint: "https://api.freshjuice.dev/robotstxt-analyzer",

    // Computed properties for score styling
    get scoreCardClass() {
      const score = this.results?.summary?.score || 0;
      if (score >= 90) return "border-green-200 bg-green-50";
      if (score >= 70) return "border-blue-200 bg-blue-50";
      if (score >= 50) return "border-yellow-200 bg-yellow-50";
      return "border-red-200 bg-red-50";
    },

    get scoreBadgeClass() {
      const score = this.results?.summary?.score || 0;
      if (score >= 90) return "border-green-300 bg-green-100 text-green-700";
      if (score >= 70) return "border-blue-300 bg-blue-100 text-blue-700";
      if (score >= 50) return "border-yellow-300 bg-yellow-100 text-yellow-700";
      return "border-red-300 bg-red-100 text-red-700";
    },

    // Normalize URL to construct robots.txt URL
    normalizeUrl(url) {
      if (!url) return "";

      // Remove whitespace
      url = url.trim();

      // Add protocol if missing
      if (!url.match(/^https?:\/\//i)) {
        url = "https://" + url;
      }

      try {
        const urlObj = new URL(url);
        // Construct robots.txt URL at root
        return `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      } catch (e) {
        debugLog("URL parsing error:", e);
        return url; // Return original if parsing fails
      }
    },

    async analyzeRobotsTxt() {
      this.error = null;
      this.results = null;
      this.isLoading = true;

      try {
        // Check for blocked AI platform URLs (only in URL mode)
        if (this.inputMode === "url") {
          const normalizedUrl = this.normalizeUrl(this.robotsUrl);
          if (isAIPlatformUrl(normalizedUrl)) {
            this.error = AI_PLATFORM_ERROR_MESSAGE;
            this.isLoading = false;
            return;
          }
        }

        const requestBody =
          this.inputMode === "text"
            ? { text: this.robotsText }
            : { url: this.normalizeUrl(this.robotsUrl) };

        debugLog("Analyzing robots.txt:", requestBody);

        const response = await fetch(this.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle error responses
          this.error = getFriendlyErrorMessage(response.status, data.detail);
          debugLog("API error:", data);
          return;
        }

        this.results = data;
        debugLog("Analysis results:", data);
      } catch (err) {
        debugLog("Fetch error:", err);
        this.error = getFriendlyErrorMessage(null, err?.message);
      } finally {
        this.isLoading = false;
      }
    },

    renderIssues() {
      if (!this.results?.issues) return "";

      // Group issues by severity
      const severityOrder = [
        "critical",
        "error",
        "warning",
        "medium",
        "low",
        "info",
      ];
      const groupedIssues = {};

      severityOrder.forEach((severity) => {
        groupedIssues[severity] = this.results.issues.filter(
          (issue) => issue.severity === severity,
        );
      });

      let html = "";

      severityOrder.forEach((severity) => {
        const issues = groupedIssues[severity];
        if (issues.length === 0) return;

        const severityConfig = {
          critical: {
            label: "Critical",
            bgColor: "bg-red-50",
            borderColor: "border-red-300",
            textColor: "text-red-700",
            badgeClasses: "border-red-300 bg-red-50 text-red-700",
          },
          error: {
            label: "High",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-300",
            textColor: "text-orange-700",
            badgeClasses: "border-orange-300 bg-orange-50 text-orange-700",
          },
          warning: {
            label: "Medium",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-300",
            textColor: "text-yellow-700",
            badgeClasses: "border-yellow-300 bg-yellow-50 text-yellow-700",
          },
          medium: {
            label: "Medium",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-300",
            textColor: "text-yellow-700",
            badgeClasses: "border-yellow-300 bg-yellow-50 text-yellow-700",
          },
          low: {
            label: "Low",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-300",
            textColor: "text-blue-700",
            badgeClasses: "border-blue-300 bg-blue-50 text-blue-700",
          },
          info: {
            label: "Low",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-300",
            textColor: "text-blue-700",
            badgeClasses: "border-blue-300 bg-blue-50 text-blue-700",
          },
        };

        const config = severityConfig[severity];

        html += `
          <div class="${config.bgColor} border-2 ${config.borderColor} rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs px-2 py-0.5 rounded-full border ${config.badgeClasses}">${config.label}</span>
              <span class="text-sm ${config.textColor}">${issues.length} issue${issues.length > 1 ? "s" : ""}</span>
            </div>
            <div class="space-y-3">
              ${issues
                .map(
                  (issue) => `
                <div class="text-sm">
                  ${issue.line ? `<div class="font-mono text-xs text-gray-600 mb-1">Line ${issue.line}</div>` : ""}
                  <div class="font-medium ${config.textColor}">${this.escapeHtml(issue.message)}</div>
                  ${issue.recommendation ? `<div class="text-gray-700 mt-1">${this.escapeHtml(issue.recommendation)}</div>` : ""}
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
      });

      return html;
    },

    renderRules() {
      if (!this.results?.rules) return "";

      // Group rules by user agent
      const groupedRules = {};

      this.results.rules.forEach((rule) => {
        if (!groupedRules[rule.userAgent]) {
          groupedRules[rule.userAgent] = [];
        }
        groupedRules[rule.userAgent].push(rule);
      });

      let html = "";

      Object.entries(groupedRules).forEach(([userAgent, rules]) => {
        const displayName =
          userAgent === "*" ? `${userAgent} (All Bots)` : userAgent;

        html += `
          <details class="border-2 border-gray-200 rounded-xl overflow-hidden">
            <summary class="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors font-medium flex items-center gap-2">
              <span class="text-gray-700">User-agent:</span>
              <span class="font-mono text-terminal">${this.escapeHtml(displayName)}</span>
              <span class="text-xs text-gray-500 ml-auto">${rules.length} rule${rules.length > 1 ? "s" : ""}</span>
            </summary>
            <div class="px-4 py-3 space-y-2">
              ${rules
                .map((rule) => {
                  if (rule.type === "allow") {
                    return `<div class="flex items-center gap-2 text-sm">
                      <span class="text-green-600">✓</span>
                      <span class="font-mono text-gray-700">Allow: ${this.escapeHtml(rule.path)}</span>
                      <span class="text-xs text-gray-500 ml-auto">Line ${rule.line}</span>
                    </div>`;
                  } else if (rule.type === "disallow") {
                    return `<div class="flex items-center gap-2 text-sm">
                      <span class="text-red-600">✗</span>
                      <span class="font-mono text-gray-700">Disallow: ${this.escapeHtml(rule.path)}</span>
                      <span class="text-xs text-gray-500 ml-auto">Line ${rule.line}</span>
                    </div>`;
                  } else if (rule.type === "crawl-delay") {
                    return `<div class="flex items-center gap-2 text-sm">
                      <span>⏱</span>
                      <span class="font-mono text-gray-700">Crawl-delay: ${rule.value}s</span>
                      <span class="text-xs text-gray-500 ml-auto">Line ${rule.line}</span>
                    </div>`;
                  }
                  return "";
                })
                .join("")}
            </div>
          </details>
        `;
      });

      return html;
    },

    escapeHtml(str) {
      if (!str) return "";
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    },

    reset() {
      this.robotsText = "";
      this.robotsUrl = "";
      this.error = null;
      this.results = null;
      this.isLoading = false;
      debugLog("Robots.txt Analyzer reset");
    },

    init() {
      debugLog("Robots.txt Analyzer initialized");
    },
  }));
});
