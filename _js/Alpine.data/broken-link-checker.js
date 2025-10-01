/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags, allowHttpUrl } from "../modules/_sanitize";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    urls: "",
    result: [],
    errorMessage: "",
    buttonLabel: "Check Links",
    openIndex: -2,
    state: "idle", // idle, loading, success, error
    checkUrl(url) {
      url = stripTags(url);
      return allowHttpUrl(url);
    },

    async checkLinks(event) {
      event.preventDefault();

      this.result = [];
      this.errorMessage = "";

      const checkList = this.urls.split("\n").reduce((list, link) => {
        const cleanedLink = this.checkUrl(link);
        if (cleanedLink.trim() !== "") {
          list.push(cleanedLink);
        }
        return list;
      }, []);

      if (checkList.length === 0) {
        this.errorMessage = "Please enter at least one URL.";
        return;
      }

      debugLog("Checking links");

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

          // debugLog(response);

          if (response.status !== 200) {
            this.result[i] = {
              url: link,
              status: "error",
              data: {},
              totalBroken: 0,
            };
          } else {
            const data = await response.json();
            this.result[i] = {
              url: link,
              status: "success",
              data: data,
              totalBroken: 0,
            };
          }
        } catch (error) {
          this.state = "error";
          this.errorMessage = error;
          this.result[i] = {
            url: link,
            status: "error",
            data: {},
            totalBroken: -1,
          };
        }

        if (this.result[i].status === "success") {
          this.result[i].totalBroken = Object.keys(this.result[i].data).reduce(
            (count, code) => {
              if (
                (400 <= parseInt(code) && parseInt(code) < 500) ||
                parseInt(code) === 999
              ) {
                return count + this.result[i].data[code].length;
              }

              return count;
            },
            0,
          );
        }

        i++;
      }

      this.state = "success";

      setTimeout(() => {
        this.state = "idle";
      }, 2000);
    },
    init() {
      debugLog("Broken Link Checker initialized");
    },
  }));
});
