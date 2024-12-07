/* global Alpine Prism */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("MetadataChecker", () => ({
    targetUrl: '',
    status: "idle", // idle, loading, success, error
    showResults: false,
    loading: false,
    buttonLabel: "Check Website Metadata",
    previewData: {},
    metaTags: "",
    setButtonLabel() {
      switch (this.status) {
        case "loading":
          this.buttonLabel = "Fetching Website Metadata...";
          break;
        case "success":
          this.buttonLabel = "Check Another Website";
          break;
        case "error":
          this.buttonLabel = "Try Again with a Different URL";
          break;
        default:
          this.buttonLabel = "Check Website Metadata";
      }
    },
    initProcessing() {
      this.initLoading();
      this.fetchPageData();
    },
    initLoading() {
      this.status = "loading";
      this.setButtonLabel();
      this.showResults = false;
      this.loading = true;
    },
    stopLoading() {
      this.status = "idle";
      this.setButtonLabel();
      this.loading = false;
    },
    initSuccess() {
      debugLog("S for Success");
      this.status = "success";
      this.setButtonLabel();
      this.showResults = true;
      this.loading = false;
    },
    initError(error) {
      this.status = "error";
      this.setButtonLabel();
      this.showResults = false;
      this.loading = false;
      console.error(error);
    },
    isValidUrl(url) {
      const urlRegex = /^(http|https):\/\/[^ "]+$/;
      return urlRegex.test(url);
    },
    escapeHTML(htmlString) {
      return htmlString
        .replace(/^[ \t]+/gm, '') // Remove leading spaces
        //.replace(/&/g, '&amp;')   // Replace & first
        //.replace(/</g, '&lt;')    // Replace <
        //.replace(/>/g, '&gt;')    // Replace >
        //.replace(/"/g, '&quot;')  // Replace "
        //.replace(/'/g, '&#39;');  // Replace '
    },
    generateMetaTags(data) {
      if (!data) {
        this.metaTags = "Metadata not available";
      }

      let returnString = "";

      if (Object.keys(data.metadata).length > 0) {
        returnString = this.escapeHTML(`<!-- HTML Meta Tags -->`);
        for (const [key, value] of Object.entries(data.metadata)) {
          if (value) {
            returnString += this.escapeHTML(`\n<meta name="${key}" content="${value}">`);
          }
        }
      }

      // Open Graph data
      if (Object.keys(data.og).length > 0) {
        returnString += this.escapeHTML(`\n\n<!-- Open Graph / Facebook Meta Tags -->`);
        for (const [key, value] of Object.entries(data.og)) {
          if (value) {
            returnString += this.escapeHTML(`\n<meta property="${key}" content="${value}">`);
          }
        }
      }

      // Twitter Card data
      if (Object.keys(data.twitter).length > 0) {
        returnString += this.escapeHTML(`\n\n<!-- X / Twitter Meta Tags -->`);
        for (const [key, value] of Object.entries(data.twitter)) {
          if (value) {
            returnString += this.escapeHTML(`\n<meta name="${key}" content="${value}">`);
          }
        }
      }

      if (typeof Prism === "object" && typeof Prism.highlight === "function") {
        this.metaTags = Prism.highlight(returnString, Prism.languages.html, 'html');
      } else {
        this.metaTags = returnString;
      }
    },
    fetchPageData() {
      if (!this.isValidUrl(this.targetUrl)) {
        this.initError("Invalid URL provided");
        return;
      }
      fetch("/api/metadata-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUrl: this.targetUrl }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          this.previewData = data;
          this.generateMetaTags(data);
          debugLog('Response Data:', data);
          this.initSuccess();
        })
        .catch((error) => {
          this.initError(error);
        });
    },
    init() {
      debugLog("Metadata Checker initialized");
      //loadStylesheet("https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css");
      //loadScript("https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js");
    }
  }));
});
