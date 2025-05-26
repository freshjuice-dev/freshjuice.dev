/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("AmIResponsive", () => ({
    iframeSrc: `about:blank`,
    targetUrl: ``,
    _GET(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    },
    setIframeSrc() {
      let link =
        this.targetUrl && this.targetUrl.length > 0
          ? this.targetUrl
          : `https://example.com`;
      link = link.replace(/</g, `&lt;`).replace(/>/g, `&gt;`);
      if (link.indexOf(`http`) !== 0) link = `https://${link}`;
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
