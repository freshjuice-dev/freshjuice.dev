/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    result: [],
    urls: "",
    state: "idle", // idle, checking, success, error
    async checkLinks(event) {
      debugLog("Checking links");
      event.preventDefault();

      let checkList = this.urls.split("\n");

      let hasErrors = false;
      for (let link of checkList) {
        try {
          // Send the URL to your own backend endpoint
          const response = await fetch(
            "http://localhost:8787/broken-link-checker",
            {
              method: "POST",
              body: JSON.stringify({ targetUrl: link }),
            },
          );

          // TODO: Sometimes the 405 or 505 (forgot) returns 999 inside object for some odd reason

          // Assume the API returns a JSON object like { url, statusCode, statusText }
          const data = await response.json();
          this.result.push(data);
        } catch (error) {
          this.result.push({
            url: link,
            statusCode: error.status,
            statusText: error.message,
          });
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
