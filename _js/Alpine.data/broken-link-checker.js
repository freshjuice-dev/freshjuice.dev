/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    result: [],
    urls: "",
    status: "idle", // idle, loading, success, error
    checkLinks() {},
    init() {
      debugLog("Broken Link Checker initialized");
    },
  }));
});
