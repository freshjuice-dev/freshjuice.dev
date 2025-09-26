/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags, allowHttpUrl } from "../modules/_sanitize";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    urls: "",
    result: {},
    isChecking: false,
    buttonLabel: "Check Links",
    openIndex: -2,
    keysArray: [],
    urlsStates: [],
    state: "idle", // idle, checking, success, error
    setButtonLabel() {
      switch (this.state) {
        case "loading":
          this.buttonLabel = "Checking for Broken Links...";
          break;
        case "success":
          this.buttonLabel = "Check More Links";
          break;
        case "error":
          this.buttonLabel = "Please try with a different URL";
          break;
        default:
          this.buttonLabel = "Check Links";
      }
    },
    getIndex(url) {
      return this.keysArray.indexOf(url);
    },
    isValidUrl(url) {
      let strippedUrl = stripTags(url);
      return allowHttpUrl(strippedUrl);
    },

    async checkLinks(event) {
      debugLog("Checking links");
      event.preventDefault();

      if (!this.urls.trim()) {
        alert("Please enter at least one URL.");
        return;
      }

      this.isChecking = true;
      this.result = {};

      const checkList = this.urls
        .split("\n")
        .filter((link) => link.trim() !== "");

      checkList.forEach((link) => {
        if (!this.isValidUrl(link)) {
          throw new Error("Invalid URL format");
        } else {
          this.result[link] = {};
          this.urlsStates.push("loading");
        }
      });

      let i = 0;
      let link = "";
      try {
        for (link of checkList) {
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
          this.urlsStates[i] = "success";
          i++;
        }
      } catch (error) {
        this.result[link] = {};
        this.urlsStates[i] = "error";
      }

      this.keysArray = Object.keys(this.result);
    },
    init() {
      debugLog("Broken Link Checker initialized");
    },
  }));
});
