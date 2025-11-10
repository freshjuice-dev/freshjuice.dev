/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags, allowHttpUrl } from "../modules/_sanitize";

document.addEventListener("alpine:init", () => {
  Alpine.data("SeoAnalyzer", () => ({
    // State
    url: "",
    result: null,
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

    reset() {
      this.result = null;
      this.errorMessage = "";
      this.state = "idle";
      this.openIndex = [];
      this.buttonLabel = "Analyze SEO";
    },

    sanitizeUrl(u) {
      u = stripTags(u);
      return allowHttpUrl(u);
    },

    // Encoded current URL (prefer analyzed result url)
    encodedUrl() {
      const u = this.result && this.result.url ? this.result.url : this.url;
      const cleaned = this.sanitizeUrl(u || "");
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

    async analyze(event) {
      if (event) event.preventDefault();
      this.errorMessage = "";

      const cleaned = this.sanitizeUrl(this.url);
      if (!cleaned) {
        this.errorMessage = "Please enter a valid absolute URL (http/https).";
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
        const msg = String(e && e.message ? e.message : e);
        this.errorMessage = this.mapError(msg);
        this.state = "error";
        this.buttonLabel = "Try again";
      }
    },

    mapError(msg) {
      if (/Invalid URL/i.test(msg))
        return "Invalid URL format (must be absolute http/https).";
      if (/not html/i.test(msg))
        return "Target is not HTML (unsupported content type).";
      if (/reachable/i.test(msg))
        return "URL not reachable. Check the address and try again.";
      if (/Blocked host/i.test(msg)) return "The host is blocked.";
      if (/Invalid JSON body/i.test(msg))
        return "Internal error: invalid JSON body sent.";
      if (/timeout|abort/i.test(msg))
        return "Fetch timeout. The request took too long.";
      if (/Upstream error/i.test(msg)) return msg; // already formatted
      return msg || "Something went wrong. Please try again.";
    },

    init() {
      debugLog("SEO Analyzer initialized");
      // Autofill and auto-run if ?url= is provided
      try {
        const params = new URLSearchParams(location.search);
        const q = params.get("url");
        if (q) {
          const cleaned = this.sanitizeUrl(q);
          if (cleaned) {
            this.url = cleaned;
            // Defer to ensure component is fully mounted
            if (this.$nextTick) {
              this.$nextTick(() => this.analyze());
            } else {
              setTimeout(() => this.analyze(), 0);
            }
          } else {
            // Prefill raw to aid correction but don't auto-run
            this.url = String(q);
          }
        }
      } catch (e) {
        // ignore URLSearchParams errors in non-browser contexts
      }
    },
  }));
});
