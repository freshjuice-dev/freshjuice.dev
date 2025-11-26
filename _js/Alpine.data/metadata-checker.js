/* global Alpine Prism */
import debugLog from "../modules/_debugLog";
import {
  isAIPlatformUrl,
  AI_PLATFORM_ERROR_MESSAGE,
} from "../modules/_blockedDomains";
import { getFriendlyErrorMessage } from "../modules/_errorMessages";

document.addEventListener("alpine:init", () => {
  Alpine.data("MetadataChecker", () => ({
    targetUrl: "",
    status: "idle", // idle, loading, success, error
    showResults: false,
    loading: false,
    buttonLabel: "Check Website Metadata",
    previewData: {},
    metaTags: "",
    errorMessage: "",
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
      history.pushState({}, "", `?url=${encodeURIComponent(this.targetUrl)}`);
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
    getPreviewImage(network) {
      let returnString = "";
      switch (network) {
        case "linkedin":
        case "facebook":
          returnString = this.previewData.og["og:image"] || "";
          break;
        case "twitter":
          returnString =
            this.previewData.twitter["twitter:image"] ||
            this.previewData.og["og:image"] ||
            "";
          break;
        default:
          break;
      }
      if (!returnString) {
        return "/img/nada-og-image.jpg";
      }
      if (returnString.startsWith("//")) {
        return `https:${returnString}`;
      }
      return returnString.startsWith("/")
        ? `https://${this.previewData.homeUrl}${returnString}`
        : returnString;
    },
    escapeHTML(htmlString) {
      return htmlString.replace(/^[ \t]+/gm, ""); // Remove leading spaces
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
            if (key === "title") {
              returnString += this.escapeHTML(`\n<title>${value}</title>`);
            } else if (key === "canonical") {
              returnString += this.escapeHTML(
                `\n<link rel="canonical" href="${value}">`,
              );
            } else {
              returnString += this.escapeHTML(
                `\n<meta name="${key}" content="${value}">`,
              );
            }
          }
        }
      }

      // Open Graph data
      if (Object.keys(data.og).length > 0) {
        returnString += this.escapeHTML(`\n\n<!-- Open Graph Meta Tags -->`);
        for (const [key, value] of Object.entries(data.og)) {
          if (value) {
            returnString += this.escapeHTML(
              `\n<meta property="${key}" content="${value}">`,
            );
          }
        }
      }

      // Twitter Card data
      if (Object.keys(data.twitter).length > 0) {
        returnString += this.escapeHTML(`\n\n<!-- X.com Meta Tags -->`);
        for (const [key, value] of Object.entries(data.twitter)) {
          if (value) {
            returnString += this.escapeHTML(
              `\n<meta name="${key}" content="${value}">`,
            );
          }
        }
      }

      if (typeof Prism === "object" && typeof Prism.highlight === "function") {
        this.metaTags = Prism.highlight(
          returnString,
          Prism.languages.html,
          "html",
        );
      } else {
        this.metaTags = returnString;
      }
    },
    fetchPageData() {
      if (!this.isValidUrl(this.targetUrl)) {
        this.errorMessage = "Invalid URL provided";
        this.initError(this.errorMessage);
        return;
      }
      // Check for blocked AI platform URLs
      if (isAIPlatformUrl(this.targetUrl)) {
        this.errorMessage = AI_PLATFORM_ERROR_MESSAGE;
        this.initError(this.errorMessage);
        return;
      }
      fetch("https://api.freshjuice.dev/metadata-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUrl: this.targetUrl,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            // Try to get error details from response body
            let errorDetail = "";
            try {
              const errorData = await response.json();
              errorDetail =
                errorData.detail || errorData.message || errorData.error || "";
            } catch {
              // Response body is not JSON, ignore
            }
            const error = new Error(
              errorDetail || `HTTP error! status: ${response.status}`,
            );
            error.status = response.status;
            throw error;
          }
          return response.json();
        })
        .then((data) => {
          this.previewData = data;
          this.generateMetaTags(data);
          debugLog("Response Data:", data);
          this.initSuccess();
        })
        .catch((error) => {
          this.errorMessage = getFriendlyErrorMessage(
            error.status,
            error.message,
          );
          this.initError(error);
        });
    },
    cleanDomain() {
      return (this.previewData.homeUrl || "")
        .toLowerCase()
        .replace(/^www\./i, "");
    },
    reset() {
      history.pushState({}, "", `/tools/metadata-checker/`);
      //window.scrollTo(0, 0);
      this.showResults = false;
      this.targetUrl = "";
      this.previewData = {};
      this.metaTags = "";
      this.errorMessage = "";
      this.status = "idle";
      this.setButtonLabel();
      this.$refs.targetUrl.focus();
    },
    init() {
      debugLog("Metadata Checker initialized");
      //loadStylesheet("https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css");
      //loadScript("https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js");
      const urlParams = new URLSearchParams(window.location.search);
      const url = urlParams.get("url");
      if (url) {
        this.targetUrl = url;
        this.initProcessing();
      }
    },
  }));
});
