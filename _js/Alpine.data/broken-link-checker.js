/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags, allowHttpUrl } from "../modules/_sanitize";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    urls: "",
    result: [],
    isChecking: false,
    buttonLabel: "Check Links",
    openIndex: -2,
    state: "idle", // idle, checking, success, error
    isValidUrl(url) {
      let strippedUrl = stripTags(url);
      debugLog(strippedUrl);
      debugLog(allowHttpUrl(strippedUrl));
      return allowHttpUrl(strippedUrl);
    },

    async checkLinks(event) {
      debugLog("Checking links");
      event.preventDefault();

      this.result = [];

      const checkList = this.urls.split("\n").filter((link) => {
        link = this.isValidUrl(link);
        return link.trim() !== "";
      });

      if (checkList.length === 0) {
        alert("Please enter at least one URL.");
        this.urls = "";
        return;
      }

      this.result = checkList.map((link) => ({
        url: link,
        status: "loading",
        data: {},
        totalBroken: 0,
      }));

      this.state = "loading";
      let i = 0;

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

          debugLog(response);

          if (response.status !== 200) {
            this.result[i] = {
              url: link,
              status: "error",
              data: {},
              totalBroken: 0,
            };
          }

          const data = await response.json();
          this.result[i] = {
            url: link,
            status: "success",
            data: data,
            totalBroken: 0,
          };
          this.state = "success";
        } catch (error) {
          this.state = "error";
          this.result[i] = {
            url: link,
            status: "error",
            data: {},
            totalBroken: 0,
          };
        }

        this.result[i].totalBroken = Object.keys(this.result[i].data).reduce(
          (count, code) => {
            if (parseInt(code) % 400 < 100 || parseInt(code) === 999) {
              return count + this.result[i].data[code].length;
            }

            return count;
          },
          0,
        );

        i++;
      }
    },
    init() {
      debugLog("Broken Link Checker initialized");
    },
  }));
});
