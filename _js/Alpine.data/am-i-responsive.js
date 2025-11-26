/* global Alpine */
import debugLog from "../modules/_debugLog";
import {
  isAIPlatformUrl,
  AI_PLATFORM_ERROR_MESSAGE,
} from "../modules/_blockedDomains";

document.addEventListener("alpine:init", () => {
  Alpine.data("AmIResponsive", () => ({
    iframeSrc: `about:blank`,
    targetUrl: ``,
    errorMessage: ``,
    _GET(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    },
    setIframeSrc() {
      this.errorMessage = ``;
      let link =
        this.targetUrl && this.targetUrl.length > 0
          ? this.targetUrl
          : `https://example.com`;
      link = link.replace(/</g, `&lt;`).replace(/>/g, `&gt;`);
      if (link.indexOf(`http`) !== 0) link = `https://${link}`;

      // Check for blocked AI platform URLs
      if (isAIPlatformUrl(link)) {
        this.errorMessage = AI_PLATFORM_ERROR_MESSAGE;
        this.iframeSrc = `about:blank`;
        return;
      }

      window.history.pushState({}, document.title, `?link=${link}`);
      this.iframeSrc = link;
    },
    init() {
      debugLog("Am I Responsive initialized");
      if (this._GET(`link`)) this.targetUrl = this._GET(`link`);
      this.setIframeSrc();
    },
  }));
});
