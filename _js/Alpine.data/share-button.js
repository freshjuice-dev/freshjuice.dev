/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("shareButton", () => ({
    message: "",
    isApple:
      /Mac|iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,

    async share() {
      const shareData = {
        title: document.title,
        text: document.querySelector('meta[name="description"]')?.content || "",
        url: window.location.href,
      };

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          debugLog("shareButton: Using Web Share API");
          await navigator.share(shareData);
          debugLog("shareButton: Share successful");
        } catch (err) {
          if (err.name === "AbortError") {
            debugLog("shareButton: Share cancelled by user");
          } else {
            debugLog("shareButton: Share failed", err);
            this.copyToClipboard();
          }
        }
      } else {
        debugLog(
          "shareButton: Web Share API not available, copying to clipboard",
        );
        this.copyToClipboard();
      }
    },

    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(window.location.href);
        debugLog("shareButton: Link copied to clipboard");
        this.message = "Link copied!";
        setTimeout(() => {
          this.message = "";
        }, 2000);
      } catch (err) {
        debugLog("shareButton: Failed to copy to clipboard", err);
        this.message = "Copy failed";
        setTimeout(() => {
          this.message = "";
        }, 2000);
      }
    },

    init() {
      debugLog("shareButton: Initialized", { isApple: this.isApple });
    },
  }));
});
