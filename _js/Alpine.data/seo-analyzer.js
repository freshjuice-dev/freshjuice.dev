/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags } from "../modules/_sanitize";
import {
  isAIPlatformUrl,
  AI_PLATFORM_ERROR_MESSAGE,
} from "../modules/_blockedDomains";
import { getFriendlyErrorMessage } from "../modules/_errorMessages";

document.addEventListener("alpine:init", () => {
  Alpine.data("SeoAnalyzer", () => ({
    // State
    url: "",
    result: null,
    metadata: null, // stores generatedBy, toolUrl, aiAssistantPrompt
    errorMessage: "",
    state: "idle", // idle, loading, success, error
    buttonLabel: "Analyze SEO",
    openIndex: [], // expanded recommendations

    // Options
    options: {
      checkSemantics: true,
      checkSchemas: true,
      checkHeadings: true,
      checkMeta: true,
      checkAccessibility: true,
      checkRobots: true,
    },

    // Helpers / derived
    get analyzedAtLocal() {
      if (!this.result || !this.result.analyzedAt) return "";
      try {
        return new Date(this.result.analyzedAt).toLocaleString();
      } catch (e) {
        return String(this.result.analyzedAt);
      }
    },

    get robotsFlags() {
      if (!this.result || !this.result.meta) return "";
      const m = this.result.meta;
      const parts = [];
      if (m.isNoIndex) parts.push("noindex");
      if (m.isNoFollow) parts.push("nofollow");
      return parts.length ? parts.join(", ") : "index, follow";
    },

    get jsonldPretty() {
      if (!this.result || !this.result.schemas || !this.result.schemas.jsonld)
        return "";
      try {
        return JSON.stringify(this.result.schemas.jsonld, null, 2);
      } catch (e) {
        return "";
      }
    },

    // robots.txt helpers
    get hasRobotsTxtData() {
      return !!(this.result && this.result.robotsTxt);
    },

    get robotsTxtStatus() {
      const data = this.result && this.result.robotsTxt;
      if (!data) return null;
      return {
        hasFile: !!data.hasRobotsTxt,
        hasLlmsTxt: !!data.hasLlmsTxt,
        allowsCrawling: !!data.robotsAllowsCrawling,
        hasSitemap: !!data.hasSitemap,
        hasUserAgent: !!data.hasUserAgent,
        robotsTxtUrl: data.robotsTxtUrl || "",
        llmsTxtUrl: data.llmsTxtUrl || "",
        issues: Array.isArray(data.issues) ? data.issues : [],
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
      };
    },

    get sortedRecommendations() {
      if (!this.result || !Array.isArray(this.result.recommendations))
        return [];
      const priority = { critical: 0, high: 1, medium: 2, low: 3 };
      return [...this.result.recommendations].sort((a, b) => {
        const pa = priority[(a.severity || "").toLowerCase()] ?? 99;
        const pb = priority[(b.severity || "").toLowerCase()] ?? 99;
        if (pa !== pb) return pa - pb;
        return (a.title || "").localeCompare(b.title || "");
      });
    },

    // Normalize new API shape for schemas.missing (object map) while supporting legacy array
    get missingSchemasList() {
      const schemas = this.result && this.result.schemas;
      if (!schemas || schemas.missing == null) return [];
      const missing = schemas.missing;
      if (Array.isArray(missing)) {
        return missing.map((name) => ({ name }));
      }
      if (typeof missing === "object") {
        return Object.keys(missing).map((name) => {
          const v = missing[name] || {};
          return {
            name,
            schemaUrl: typeof v.schemaUrl === "string" ? v.schemaUrl : null,
            jsonLdExample:
              typeof v.jsonLdExample === "object" && v.jsonLdExample !== null
                ? v.jsonLdExample
                : typeof v.jsonLdExample === "string"
                  ? v.jsonLdExample
                  : null,
          };
        });
      }
      return [];
    },

    hasSchemaExample(item) {
      if (!item) return false;
      const ex = item.jsonLdExample;
      if (typeof ex === "string") return ex.trim().length > 0;
      if (ex && typeof ex === "object") return Object.keys(ex).length > 0;
      return false;
    },

    jsonLdExamplePretty(item) {
      if (!item || item.jsonLdExample == null) return "";
      const ex = item.jsonLdExample;
      try {
        if (typeof ex === "object") return JSON.stringify(ex, null, 2);
        if (typeof ex === "string") {
          // keep as-is; if it's valid JSON string, try to pretty print
          try {
            const parsed = JSON.parse(ex);
            return JSON.stringify(parsed, null, 2);
          } catch (e) {
            return ex;
          }
        }
      } catch (e) {
        // ignore
      }
      return String(ex);
    },

    missingKey(name) {
      const n = String(name || "").trim();
      return `missing:${n}`;
    },

    bool(v) {
      return v ? "✅" : "❌";
    },

    severityLabel(sev) {
      const s = (sev || "").toLowerCase();
      return s === "critical"
        ? "Critical"
        : s === "high"
          ? "High"
          : s === "medium"
            ? "Medium"
            : "Low";
    },

    severityBadge(sev) {
      const s = (sev || "").toLowerCase();
      switch (s) {
        case "critical":
          return "border-red-300 bg-red-50 text-red-700";
        case "high":
          return "border-orange-300 bg-orange-50 text-orange-700";
        case "medium":
          return "border-yellow-300 bg-yellow-50 text-yellow-700";
        default:
          return "border-blue-300 bg-blue-50 text-blue-700";
      }
    },

    // Prism helpers
    escapeCode(str) {
      if (str == null) return "";
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    },
    highlightPrism() {
      try {
        if (window.Prism && typeof window.Prism.highlightAll === "function") {
          window.Prism.highlightAll();
        }
      } catch (e) {
        // ignore
      }
    },

    // Show toggle only when there are details to reveal (e.g., code snippet)
    hasRecDetails(rec) {
      if (!rec) return false;
      const code = rec.code;
      if (typeof code === "string") return code.trim().length > 0;
      return !!code;
    },

    get scoreCardClass() {
      const s =
        this.result && typeof this.result.score === "number"
          ? this.result.score
          : 0;
      if (s >= 90) return "border-green-200 bg-green-50";
      if (s >= 75) return "border-blue-200 bg-blue-50";
      if (s >= 50) return "border-yellow-200 bg-yellow-50";
      return "border-red-200 bg-red-50";
    },

    get scoreBadgeClass() {
      const s =
        this.result && typeof this.result.score === "number"
          ? this.result.score
          : 0;
      if (s >= 90) return "border-green-300 bg-green-100 text-green-700";
      if (s >= 75) return "border-blue-300 bg-blue-100 text-blue-700";
      if (s >= 50) return "border-yellow-300 bg-yellow-100 text-yellow-700";
      return "border-red-300 bg-red-100 text-red-700";
    },

    toggleOpen(id) {
      this.openIndex = this.openIndex.includes(id)
        ? this.openIndex.filter((i) => i !== id)
        : [...this.openIndex, id];
      if (this.$nextTick) {
        this.$nextTick(() => this.highlightPrism());
      } else {
        setTimeout(() => this.highlightPrism(), 0);
      }
    },

    copy(text) {
      if (!text) return;
      navigator.clipboard?.writeText(text).then(
        () => {
          debugLog("Copied to clipboard");
        },
        () => {
          // Ignore
        },
      );
    },

    downloadJson() {
      if (!this.result) return;
      try {
        // Merge metadata properties at the beginning
        const reportData = {
          ...(this.metadata || {}),
          ...this.result,
        };

        // Create JSON string (single line)
        const jsonString = JSON.stringify(reportData);
        const blob = new Blob([jsonString], { type: "application/json" });

        // Generate filename with domain, date, and time
        const url = this.result.url || this.url || "website";
        const domain = url
          .replace(/^https?:\/\//, "")
          .split("/")[0]
          .replace(/\W/g, "-");
        const isoString = new Date().toISOString();
        const date = isoString.split("T")[0];
        const time = isoString.split("T")[1].split(".")[0].replace(/:/g, "-");
        const filename = `freshjuice-seo-analysis_${domain}_${date}_${time}.json`;

        // Trigger download
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        debugLog(`Downloaded JSON: ${filename}`);
      } catch (e) {
        debugLog("Failed to download JSON:", e);
      }
    },

    reset() {
      this.result = null;
      this.metadata = null;
      this.errorMessage = "";
      this.state = "idle";
      this.openIndex = [];
      this.buttonLabel = "Analyze SEO";
    },

    // Normalize to HTTPS scheme and sanitize
    normalizeHttps(u) {
      u = String(u || "").trim();
      if (!u) return "";
      // remove any leading protocol and force https
      try {
        // If it already parses as a URL, coerce protocol to https
        const tmp = new URL(
          u,
          /^https?:\/\//i.test(u) ? undefined : "https://",
        );
        // If base was used, we need to detect
        let host = tmp.host;
        let path = tmp.pathname + (tmp.search || "") + (tmp.hash || "");
        if (!host && tmp.href.startsWith("https://")) {
          // Relative or schemeless input, extract from pathname
          const rest = tmp.href.replace("https://", "");
          if (/^\/?\S/.test(rest)) {
            // looks like host is included, try to rebuild
            const guess = rest.replace(/^\//, "");
            return `https://${guess}`;
          }
        }
        if (host) {
          return `https://${host}${path}`;
        }
      } catch (e) {
        // Fall through to basic cleanup
      }
      // Basic fallback cleanup: strip any http(s) and prepend https://
      const cleaned = u.replace(/^\s*https?:\/\//i, "").replace(/^\/*/, "");
      return cleaned ? `https://${cleaned}` : "";
    },

    sanitizeUrlHttps(u) {
      u = stripTags(u);
      const normalized = this.normalizeHttps(u);
      try {
        const parsed = new URL(normalized);
        if (parsed.protocol !== "https:") return "";
        // require absolute https URL with host
        if (!parsed.host) return "";
        return parsed.toString();
      } catch (e) {
        return "";
      }
    },

    // Encoded current URL (prefer analyzed result url)
    encodedUrl() {
      const u = this.result && this.result.url ? this.result.url : this.url;
      const cleaned = this.sanitizeUrlHttps(u || "");
      if (!cleaned) return "";
      try {
        return encodeURIComponent(cleaned);
      } catch (e) {
        return "";
      }
    },

    // Unified internal cross-tool link builder (no UTM params)
    buildToolLink(name) {
      const encoded = this.encodedUrl();
      if (!encoded) return "";
      const map = {
        "metadata-checker": "/tools/metadata-checker/",
        "heading-extractor": "/tools/heading-extractor/",
      };
      const base = map[name] || name || ""; // allow passing a direct path as fallback
      if (!base) return "";
      const sep = base.includes("?") ? "&" : "?";
      return `${base}${sep}url=${encoded}`;
    },

    onUrlInput(strict = false) {
      const current = String(this.url || "");
      // Always keep https:// prefix while typing
      const normalized = this.normalizeHttps(current);
      if (!strict) {
        this.url = normalized;
        return;
      }
      // On blur or strict mode, fully sanitize/validate; if invalid, still keep normalized field value
      const cleaned = this.sanitizeUrlHttps(normalized);
      this.url = cleaned || normalized;
    },

    async analyze(event) {
      if (event) event.preventDefault();
      this.errorMessage = "";

      const cleaned = this.sanitizeUrlHttps(this.url);
      if (!cleaned) {
        this.errorMessage =
          "Please enter a valid absolute HTTPS URL (must start with https://).";
        this.state = "error";
        return;
      }

      // Check for blocked AI platform URLs
      if (isAIPlatformUrl(cleaned)) {
        this.errorMessage = AI_PLATFORM_ERROR_MESSAGE;
        this.state = "error";
        return;
      }

      this.url = cleaned;
      this.state = "loading";
      this.buttonLabel = "Analyzing…";

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch("https://api.freshjuice.dev/seo-analyzer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: this.url,
            options: {
              checkSemantics: !!this.options.checkSemantics,
              checkSchemas: !!this.options.checkSchemas,
              checkHeadings: !!this.options.checkHeadings,
              checkMeta: !!this.options.checkMeta,
              checkAccessibility: !!this.options.checkAccessibility,
              checkRobots: !!this.options.checkRobots,
            },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
          // Attempt to parse error body
          let payload = {};
          try {
            payload = await res.json();
          } catch (e) {}
          const err =
            (payload && (payload.error || payload.message)) ||
            `Upstream error (status ${res.status})`;
          throw new Error(err);
        }

        const data = await res.json();
        if (!data || data.success === false) {
          const err =
            data && (data.error || data.message)
              ? data.error || data.message
              : "Unexpected API response";
          throw new Error(err);
        }

        // Store metadata for JSON export
        this.metadata = {
          generatedBy: data.generatedBy || null,
          toolUrl: data.toolUrl || null,
          aiAssistantPrompt: data.aiAssistantPrompt || null,
        };

        this.result = data.data || null;
        this.state = "success";
        this.buttonLabel = "Analyze again";
        if (this.$nextTick) {
          this.$nextTick(() => this.highlightPrism());
        } else {
          setTimeout(() => this.highlightPrism(), 0);
        }
      } catch (e) {
        debugLog(e);
        this.errorMessage = getFriendlyErrorMessage(e?.status, e?.message);
        this.state = "error";
        this.buttonLabel = "Try again";
      }
    },

    init() {
      debugLog("SEO Analyzer initialized");
      // Autofill and auto-run if ?url= is provided
      try {
        const params = new URLSearchParams(location.search);
        const q = params.get("url");
        if (q) {
          const cleaned = this.sanitizeUrlHttps(q);
          if (cleaned) {
            this.url = cleaned;
            // Defer to ensure component is fully mounted
            if (this.$nextTick) {
              this.$nextTick(() => this.analyze());
            } else {
              setTimeout(() => this.analyze(), 0);
            }
          } else {
            // Prefill raw query to let the user edit without aggressive normalization
            this.url = String(q).trim();
          }
        }
      } catch (e) {
        // ignore URLSearchParams errors in non-browser contexts
      }
    },
  }));
});
