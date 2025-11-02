/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags, allowHttpUrl } from "../modules/_sanitize";

document.addEventListener("alpine:init", () => {
  Alpine.data("HeadingExtractor", () => ({
    // UI/state
    targetUrl: "",
    buttonLabel: "Extract Headings",
    state: "idle", // idle | loading | success | error
    showResults: false,
    errorMessage: "",

    // data
    headings: [],

    setButtonLabel() {
      switch (this.state) {
        case "loading":
          this.buttonLabel = "Extracting Headings...";
          break;
        case "success":
          this.buttonLabel = "Extract Another URL";
          break;
        case "error":
          this.buttonLabel = "Try Again";
          break;
        default:
          this.buttonLabel = "Extract Headings";
      }
    },

    reset() {
      this.headings = [];
      this.showResults = false;
      this.state = "idle";
      this.errorMessage = "";
      this.setButtonLabel();
      history.pushState({}, "", location.pathname);
      this.$nextTick(() => this.$refs?.targetUrl?.focus?.());
    },

    isValidUrl(url) {
      url = stripTags(url || "");
      // Also allow schemeless cleanup via helper but enforce http(s)
      const allowed = allowHttpUrl(url);
      const exp = /^(https?:)\/\//i;
      return !!allowed && exp.test(allowed);
    },

    initProcessing(event) {
      if (event && typeof event.preventDefault === "function")
        event.preventDefault();
      this.errorMessage = "";

      if (!this.isValidUrl(this.targetUrl)) {
        this.state = "error";
        this.setButtonLabel();
        this.errorMessage =
          "Please enter a valid URL starting with http:// or https://";
        return;
      }

      this.state = "loading";
      this.setButtonLabel();
      this.showResults = false;
      this.headings = [];

      this.fetchHeadings();
    },

    async fetchHeadings() {
      const targetUrl = allowHttpUrl(stripTags(this.targetUrl));
      try {
        const response = await fetch(
          "https://api.freshjuice.dev/heading-extractor",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUrl }),
          },
        );

        debugLog(`Heading extractor → ${response.status}`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        this.headings = Array.isArray(data?.headings) ? data.headings : [];

        this.state = "success";
        this.setButtonLabel();
        this.showResults = true;
        history.pushState({}, "", `?url=${encodeURIComponent(targetUrl)}`);
      } catch (err) {
        console.error(err);
        this.state = "error";
        this.setButtonLabel();
        this.errorMessage =
          err?.message || "Something went wrong. Please try again.";
        this.showResults = false;
      }
    },

    init() {
      debugLog("Heading Extractor initialized");
      // Autofill from query
      const params = new URLSearchParams(location.search);
      const urlFromQuery = params.get("url");
      if (urlFromQuery) {
        this.targetUrl = urlFromQuery;
        // auto-run but defer to ensure refs exist
        setTimeout(() => this.initProcessing(), 0);
      }
    },
  }));
});
