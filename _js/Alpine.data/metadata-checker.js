/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("MetadataChecker", () => ({
    targetUrl: '',
    status: "idle", // idle, loading, success, error
    showResults: false,
    loading: false,
    buttonLabel: "Check Website Metadata",
    socialPreviewData: {},
    results: {
      title: "",
      type: "",
      url: "",
      homeUrl: "",
      image: "",
      imagealt: "",
      description: "",
      sitename: "",
    },
    setButtonLabel() {
      switch (this.status) {
        case "loading":
          this.buttonLabel = "Checking...";
          break;
        case "success":
          this.buttonLabel = "Check Again";
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
    async fetchPageData() {
      if (!this.isValidUrl(this.targetUrl)) {
        this.initError("Invalid URL provided");
        return;
      }
      await fetch("/api/metadata-checker", {
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
          this.results = data;
          debugLog('Response Data:', data);
          this.initSuccess();
        })
        .catch((error) => {
          this.initError(error);
        });
    }
  }));
});
