/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("llmstxtGenerator", () => ({
    // Step management
    currentStep: 1, // 1: Input, 2: Review, 3: Generate
    inputMethod: "sitemap", // 'sitemap' or 'manual'
    step1DataChanged: false, // Track if step 1 data changed after parsing/analysis
    step2DataChanged: false, // Track if step 2 data changed after generation

    // Sitemap input
    sitemapUrl: "",
    initialSitemapUrl: "", // Track initial value to detect changes
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
    initialManualUrls: "", // Track initial value to detect changes

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
    loadingMessageIndex: 0,
    loadingInterval: null,
    errorMessage: "",
    successMessage: "",

    // Fun loading messages with FreshJuice theme
    loadingMessages: [
      "Squeezing fresh content from your pages...",
      "Picking the ripest URLs from your sitemap...",
      "Blending your page titles into something smooth...",
      "Extracting the juiciest metadata...",
      "Peeling away unnecessary data...",
      "Mixing up your content categories...",
      "Pouring over your page descriptions...",
      "Garnishing with SEO goodness...",
      "Tasting your site's flavor profile...",
      "Selecting the finest organic URLs...",
      "Zesting your page titles for freshness...",
      "Pulping through your sitemap...",
      "Filtering out the seeds and stems...",
      "Crafting your perfect content blend...",
      "Chilling your data for optimal results...",
      "Washing your URLs for peak freshness...",
      "Slicing through duplicate content...",
      "Juicing every last bit of metadata...",
      "Inspecting fruit quality control...",
      "Measuring perfect vitamin SEO levels...",
      "Adding a splash of analytics...",
      "Muddling your content ingredients...",
      "Straining out low-quality pages...",
      "Checking ripeness indicators...",
      "Bottling up your best content...",
      "Pressing organic page juice...",
      "Stirring in fresh insights...",
      "Blending smooth user experiences...",
      "Infusing natural keywords...",
      "Macerating metadata morsels...",
      "Sweetening your descriptions...",
      "Handpicking premium URLs...",
      "Cold-pressing page content...",
      "Testing pH levels of your copy...",
      "Aerating your content mix...",
      "Layering flavor profiles...",
      "Reducing to perfection...",
      "Caramelizing your headlines...",
      "Simmering site structure...",
      "Marinating metadata overnight...",
      "Whisking up fresh categories...",
      "Folding in smooth transitions...",
      "Tempering your title tags...",
      "Deglazing the content pan...",
      "Basting your best pages...",
    ],

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

    get canNavigateToStep2() {
      return this.processedCount > 0;
    },

    get canNavigateToStep3() {
      return this.generatedLlmsTxt !== "";
    },

    // Methods
    startLoadingMessages() {
      // Pick a random starting message
      this.loadingMessageIndex = Math.floor(
        Math.random() * this.loadingMessages.length,
      );
      this.loadingMessage = this.loadingMessages[this.loadingMessageIndex];

      // Rotate messages every 2.5 seconds
      this.loadingInterval = setInterval(() => {
        this.loadingMessageIndex =
          (this.loadingMessageIndex + 1) % this.loadingMessages.length;
        this.loadingMessage = this.loadingMessages[this.loadingMessageIndex];
      }, 2500);
    },

    stopLoadingMessages() {
      if (this.loadingInterval) {
        clearInterval(this.loadingInterval);
        this.loadingInterval = null;
      }
      this.loadingMessage = "";
    },

    navigateToStep(step) {
      debugLog("Attempting to navigate to step:", step);

      // Can always go back to step 1
      if (step === 1) {
        this.currentStep = 1;
        this.errorMessage = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Check if step 1 data has changed
      if (step >= 2 && this.currentStep >= 2) {
        const sitemapChanged =
          this.inputMethod === "sitemap" &&
          this.sitemapUrl !== this.initialSitemapUrl;
        const manualUrlsChanged =
          this.inputMethod === "manual" &&
          this.manualUrls !== this.initialManualUrls;

        if (sitemapChanged || manualUrlsChanged) {
          this.errorMessage =
            "Input data has changed. Please re-analyze before proceeding.";
          this.step1DataChanged = true;
          return;
        }
      }

      // Navigate to step 2 if allowed
      if (step === 2) {
        if (!this.canNavigateToStep2) {
          if (this.inputMethod === "sitemap" && !this.parseResults) {
            this.errorMessage =
              "Please parse your sitemap first, then analyze the URLs.";
          } else if (this.inputMethod === "sitemap" && this.parseResults) {
            this.errorMessage =
              'Click "Analyze Selected URLs" to continue to the review step.';
          } else {
            this.errorMessage =
              'Click "Analyze URLs" to continue to the review step.';
          }
          return;
        }
        this.currentStep = 2;
        this.errorMessage = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Navigate to step 3 if allowed
      if (step === 3) {
        if (!this.canNavigateToStep3) {
          this.errorMessage =
            'Click "Generate llms.txt" to create your file first.';
          return;
        }
        this.currentStep = 3;
        this.errorMessage = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    },
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
        this.initialSitemapUrl = this.sitemapUrl; // Save for change detection
        this.step1DataChanged = false;
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
      this.errorMessage = "";
      this.successMessage = "";
      this.startLoadingMessages();

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
        this.stopLoadingMessages();
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
      this.initialManualUrls = this.manualUrls; // Save for change detection
      this.step1DataChanged = false;
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
      const suffixRegex = this.getSuffixRegex();
      const cleanedPages = this.selectedPages.map((page) => {
        if (suffixRegex && page.title) {
          const cleanedTitle = page.title.replace(suffixRegex, "").trim();
          if (cleanedTitle !== page.title) {
            return {
              ...page,
              title: cleanedTitle,
            };
          }
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
        this.step2DataChanged = false;

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

    getSuffixRegex() {
      if (!this.siteSuffix) return null;

      try {
        // Try to create a regex from the suffix
        // If it contains regex special chars (not escaped), treat as regex
        // Otherwise treat as plain text
        const hasRegexChars = /[\\^$.*+?()[\]{}|]/.test(this.siteSuffix);

        if (hasRegexChars) {
          // Treat as regex pattern - append $ to match end of string
          return new RegExp(this.siteSuffix + "$");
        } else {
          // Treat as plain text - escape and create regex
          const escaped = this.siteSuffix.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          return new RegExp(escaped + "$");
        }
      } catch (e) {
        debugLog("Invalid suffix regex:", e);
        return null;
      }
    },

    cleanPageTitle(title) {
      if (!title || !this.siteSuffix) return title;

      const suffixRegex = this.getSuffixRegex();
      if (!suffixRegex) return title;

      return title.replace(suffixRegex, "").trim();
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
      this.initialSitemapUrl = "";
      this.manualUrls = "";
      this.initialManualUrls = "";
      this.step1DataChanged = false;
      this.step2DataChanged = false;
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
