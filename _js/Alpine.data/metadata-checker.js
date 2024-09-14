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
      try {
        const response = await fetch(this.targetUrl); // CORS issue with pages that are external like youtube or any page using www.
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const metaTags = doc.querySelectorAll('meta[property^="og:"]');

        let url = new URL(this.targetUrl);
        this.results['homeUrl'] = url.hostname;

        metaTags.forEach(tag => {
          const key = tag.getAttribute('property').replace(/og:|_|:/g, '');
          this.results[key] = tag.getAttribute('content');
        });

        debugLog(this.results);

        this.initSuccess();
      } catch (error) {
        this.initError(error);
      }
    },
  }));
});
