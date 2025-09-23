/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    result: {},
    urls: "",
    state: "idle", // idle, checking, success, error
    async checkLinks(event) {
      debugLog("Checking links");
      event.preventDefault();

      let checkList = this.urls.split("\n");

      for (let link of checkList) {
        try {
          const response = await fetch(
            "https://api.freshjuice.dev/broken-link-checker",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ targetUrl: link }),
            },
          );

          this.result[link] = await response.json();

          debugLog(this.result);
        } catch (error) {
          // TODO: revise this error handling
        }
      }

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
