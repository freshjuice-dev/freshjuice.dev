/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    result: [],
    urls: "",
    state: "idle", // idle, checking, success, error
    checkLinks(event) {
      debugLog("Checking links");
      event.preventDefault();

      if (!this.urls.trim()) {
        alert("Please enter at least one URL.");
        return;
      }
      this.state = "checking";
    },
    init() {
      debugLog("Broken Link Checker initialized");
    },
  }));
});
