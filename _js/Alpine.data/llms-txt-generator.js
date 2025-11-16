/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("llmstxtGenerator", () => ({
    // Step management
    currentStep: 1, // 1: Input, 2: Review, 3: Generate
    inputMethod: "sitemap", // 'sitemap' or 'manual'

    // Sitemap input
    sitemapUrl: "",
    customHints: {
      corePattern: "",
      productPattern: "",
      docsPattern: "",
      resourcesPattern: "",
      supportPattern: "",
      blogPattern: "",
      companyPattern: "",
      legalPattern: "",
    },

    // Manual URL input
    manualUrls: "",

    // Parse results
    parseResults: null,
    totalUrls: 0,
    includedUrls: 0,
    limitApplied: false,
    sitemapsProcessed: 0,
    categorizedUrls: {
      core: [],
      product: [],
      docs: [],
      resources: [],
      support: [],
      blog: [],
      company: [],
      legal: [],
      other: [],
    },

    // Analysis results
    analyzedPages: {
      core: [],
      product: [],
      docs: [],
      resources: [],
      support: [],
      blog: [],
      company: [],
      legal: [],
      other: [],
    },
    processedCount: 0,
    failedCount: 0,
    errors: [],

    // Auto-detected site metadata from API
    detectedSite: {
      name: "",
      url: "",
      suffix: "",
      description: "",
    },

    // Selected pages for generation
    selectedPages: [],

    // Generation metadata (user can override detected values)
    siteName: "",
    siteUrl: "",
    siteSuffix: "",
    siteDescription: "",

    // Generated output
    generatedLlmsTxt: "",
    stats: null,

    // UI state
    isLoading: false,
    loadingMessage: "",
    errorMessage: "",
    successMessage: "",

    // Validation
    get isValidSitemapUrl() {
      if (!this.sitemapUrl) return false;
      try {
        new URL(this.sitemapUrl);
        return true;
      } catch {
        return false;
      }
    },

    get manualUrlsArray() {
      return this.manualUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    },

    get isValidManualUrls() {
      const urls = this.manualUrlsArray;
      return urls.length > 0 && urls.length <= 100;
    },

    get canProceedToAnalysis() {
      if (this.inputMethod === "sitemap") {
        return this.parseResults !== null && this.includedUrls > 0;
      } else {
        return this.isValidManualUrls;
      }
    },

    get canGenerate() {
      return this.selectedPages.length > 0;
    },

    get totalSelectedPages() {
      return this.selectedPages.length;
    },

    // Methods
    async parseSitemap() {
      if (!this.isValidSitemapUrl) {
        this.errorMessage = "Please enter a valid sitemap URL";
        return;
      }

      this.isLoading = true;
      this.loadingMessage = "Parsing sitemap...";
      this.errorMessage = "";
      this.successMessage = "";

      debugLog("Parsing sitemap:", this.sitemapUrl);

      try {
        const response = await fetch(
          "https://api.freshjuice.dev/llmstxt/parse-sitemap",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sitemapUrl: this.sitemapUrl,
              hints: this.getActiveHints(),
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to parse sitemap");
        }

        const data = await response.json();
        debugLog("Parse result:", data);

        this.parseResults = data;
        this.totalUrls = data.totalUrls;
        this.includedUrls = data.includedUrls;
        this.limitApplied = data.limitApplied;
        this.sitemapsProcessed = data.sitemapsProcessed;
        // Merge API response with default structure to ensure all categories exist
        this.categorizedUrls = {
          core: data.categories?.core || [],
          product: data.categories?.product || [],
          docs: data.categories?.docs || [],
          resources: data.categories?.resources || [],
          support: data.categories?.support || [],
          blog: data.categories?.blog || [],
          company: data.categories?.company || [],
          legal: data.categories?.legal || [],
          other: data.categories?.other || [],
        };

        this.successMessage = `Found ${this.totalUrls} URLs${this.limitApplied ? " (limited to 100)" : ""}`;
        this.currentStep = 2;
      } catch (error) {
        debugLog("Parse error:", error);
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
        this.loadingMessage = "";
      }
    },

    async analyzeUrls(urls) {
      this.isLoading = true;
      this.loadingMessage = `Analyzing ${urls.length} URLs...`;
      this.errorMessage = "";
      this.successMessage = "";

      debugLog("Analyzing URLs:", urls);

      try {
        const response = await fetch(
          "https://api.freshjuice.dev/llmstxt/analyze",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              urls,
              hints: this.getActiveHints(),
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to analyze URLs");
        }

        const data = await response.json();
        debugLog("Analysis result:", data);

        // Merge API response with default structure to ensure all categories exist
        this.analyzedPages = {
          core: data.results?.core || [],
          product: data.results?.product || [],
          docs: data.results?.docs || [],
          resources: data.results?.resources || [],
          support: data.results?.support || [],
          blog: data.results?.blog || [],
          company: data.results?.company || [],
          legal: data.results?.legal || [],
          other: data.results?.other || [],
        };
        this.processedCount = data.processed;
        this.failedCount = data.failed;
        this.errors = data.errors || [];

        // Store auto-detected site metadata
        if (data.site) {
          this.detectedSite = {
            name: data.site.name || "",
            url: data.site.url || "",
            suffix: data.site.suffix || "",
            description: data.site.description || "",
          };

          // Auto-populate form fields with detected values (only if user hasn't filled them)
          if (!this.siteName && data.site.name) {
            this.siteName = data.site.name;
          }
          if (!this.siteUrl && data.site.url) {
            this.siteUrl = data.site.url;
          }
          if (!this.siteSuffix && data.site.suffix) {
            this.siteSuffix = data.site.suffix;
          }
          if (!this.siteDescription && data.site.description) {
            this.siteDescription = data.site.description;
          }

          debugLog("Detected site metadata:", this.detectedSite);
        }

        // Auto-select all successfully analyzed pages
        this.selectedPages = [
          ...(data.results.core || []),
          ...(data.results.product || []),
          ...(data.results.docs || []),
          ...(data.results.resources || []),
          ...(data.results.support || []),
          ...(data.results.blog || []),
          ...(data.results.company || []),
          ...(data.results.legal || []),
          ...(data.results.other || []),
        ];

        this.successMessage = `Analyzed ${this.processedCount} pages successfully`;
        if (this.failedCount > 0) {
          this.errorMessage = `${this.failedCount} URLs failed to analyze`;
        }
      } catch (error) {
        debugLog("Analysis error:", error);
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
        this.loadingMessage = "";
      }
    },

    async analyzeFromSitemap() {
      const urls = [
        ...this.categorizedUrls.core,
        ...this.categorizedUrls.product,
        ...this.categorizedUrls.docs,
        ...this.categorizedUrls.resources,
        ...this.categorizedUrls.support,
        ...this.categorizedUrls.blog,
        ...this.categorizedUrls.company,
        ...this.categorizedUrls.legal,
        ...this.categorizedUrls.other,
      ].map((item) => item.url);

      debugLog("URLs to analyze from sitemap:", urls.length);
      await this.analyzeUrls(urls);
    },

    async analyzeFromManualUrls() {
      const urls = this.manualUrlsArray;
      if (urls.length === 0 || urls.length > 100) {
        this.errorMessage = "Please enter between 1 and 100 URLs";
        return;
      }

      debugLog("URLs to analyze (manual):", urls.length);
      await this.analyzeUrls(urls);
      this.currentStep = 2;
    },

    async generateLlmsTxt() {
      if (this.selectedPages.length === 0) {
        this.errorMessage = "Please select at least one page";
        return;
      }

      this.isLoading = true;
      this.loadingMessage = "Generating llms.txt...";
      this.errorMessage = "";
      this.successMessage = "";

      debugLog("Generating llms.txt with pages:", this.selectedPages.length);

      // Clean page titles by removing suffix before sending to API
      const cleanedPages = this.selectedPages.map((page) => {
        if (
          this.siteSuffix &&
          page.title &&
          page.title.endsWith(this.siteSuffix)
        ) {
          return {
            ...page,
            title: page.title.slice(0, -this.siteSuffix.length).trim(),
          };
        }
        return page;
      });

      try {
        const response = await fetch(
          "https://api.freshjuice.dev/llmstxt/generate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pages: cleanedPages,
              siteName: this.siteName || undefined,
              siteUrl: this.siteUrl || undefined,
              siteDescription: this.siteDescription || undefined,
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to generate llms.txt");
        }

        const data = await response.json();
        debugLog("Generation result:", data);

        this.generatedLlmsTxt = data.llmstxt;
        this.stats = data.stats;

        this.successMessage = "llms.txt generated successfully!";
        this.currentStep = 3;

        // Scroll to top to show the result
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        debugLog("Generation error:", error);
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
        this.loadingMessage = "";
      }
    },

    downloadLlmsTxt() {
      debugLog("Downloading llms.txt");
      const blob = new Blob([this.generatedLlmsTxt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "llms.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.successMessage = "llms.txt downloaded successfully!";
      setTimeout(() => {
        this.successMessage = "";
      }, 3000);
    },

    async copyToClipboard() {
      debugLog("Copying to clipboard");
      try {
        await navigator.clipboard.writeText(this.generatedLlmsTxt);
        this.successMessage = "Copied to clipboard!";
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      } catch (err) {
        debugLog("Clipboard error:", err);
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = this.generatedLlmsTxt;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          this.successMessage = "Copied to clipboard!";
          setTimeout(() => {
            this.successMessage = "";
          }, 3000);
        } catch (e) {
          this.errorMessage = "Failed to copy to clipboard";
        }
        document.body.removeChild(textarea);
      }
    },

    togglePageSelection(page) {
      const index = this.selectedPages.findIndex((p) => p.url === page.url);
      if (index > -1) {
        this.selectedPages.splice(index, 1);
      } else {
        this.selectedPages.push(page);
      }
      debugLog("Selected pages:", this.selectedPages.length);
    },

    isPageSelected(page) {
      return this.selectedPages.some((p) => p.url === page.url);
    },

    cleanPageTitle(title) {
      if (!title || !this.siteSuffix) return title;

      if (title.endsWith(this.siteSuffix)) {
        return title.slice(0, -this.siteSuffix.length).trim();
      }

      return title;
    },

    selectAllPages() {
      this.selectedPages = [
        ...(this.analyzedPages.core || []),
        ...(this.analyzedPages.product || []),
        ...(this.analyzedPages.docs || []),
        ...(this.analyzedPages.resources || []),
        ...(this.analyzedPages.support || []),
        ...(this.analyzedPages.blog || []),
        ...(this.analyzedPages.company || []),
        ...(this.analyzedPages.legal || []),
        ...(this.analyzedPages.other || []),
      ];
      debugLog("All pages selected:", this.selectedPages.length);
    },

    deselectAllPages() {
      this.selectedPages = [];
      debugLog("All pages deselected");
    },

    getActiveHints() {
      const hints = {};
      if (this.customHints.corePattern)
        hints.corePattern = this.customHints.corePattern;
      if (this.customHints.productPattern)
        hints.productPattern = this.customHints.productPattern;
      if (this.customHints.docsPattern)
        hints.docsPattern = this.customHints.docsPattern;
      if (this.customHints.resourcesPattern)
        hints.resourcesPattern = this.customHints.resourcesPattern;
      if (this.customHints.supportPattern)
        hints.supportPattern = this.customHints.supportPattern;
      if (this.customHints.blogPattern)
        hints.blogPattern = this.customHints.blogPattern;
      if (this.customHints.companyPattern)
        hints.companyPattern = this.customHints.companyPattern;
      if (this.customHints.legalPattern)
        hints.legalPattern = this.customHints.legalPattern;
      return hints;
    },

    reset() {
      debugLog("Resetting generator");
      this.currentStep = 1;
      this.sitemapUrl = "";
      this.manualUrls = "";
      this.parseResults = null;
      this.totalUrls = 0;
      this.includedUrls = 0;
      this.limitApplied = false;
      this.sitemapsProcessed = 0;
      this.categorizedUrls = {
        core: [],
        product: [],
        docs: [],
        resources: [],
        support: [],
        blog: [],
        company: [],
        legal: [],
        other: [],
      };
      this.analyzedPages = {
        core: [],
        product: [],
        docs: [],
        resources: [],
        support: [],
        blog: [],
        company: [],
        legal: [],
        other: [],
      };
      this.processedCount = 0;
      this.failedCount = 0;
      this.errors = [];
      this.detectedSite = { name: "", url: "", suffix: "", description: "" };
      this.selectedPages = [];
      this.siteName = "";
      this.siteUrl = "";
      this.siteSuffix = "";
      this.siteDescription = "";
      this.generatedLlmsTxt = "";
      this.stats = null;
      this.errorMessage = "";
      this.successMessage = "";

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    init() {
      debugLog("llms.txt Generator initialized");
    },
  }));
});
