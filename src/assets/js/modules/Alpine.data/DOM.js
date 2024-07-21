import debugLog from "../_debugLog";
import loadScript from "../_loadScript";

export default () => {
  return {
    theme: {
      dark: true,
      name: "dark",
    },

    getThemeName() {
      if (localStorage.getItem("theme")) {
        this.theme.name = localStorage.getItem("theme");
        this.theme.dark = this.theme.name === "dark";
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        this.theme.name = "dark";
        this.theme.dark = true;
      }

      return this.theme.dark ? "dark" : "light";
    },

    toggleTheme() {
      this.theme.dark = !this.theme.dark;
      this.theme.name = this.theme.dark ? "dark" : "light";
      localStorage.setItem("theme", this.theme.name);
      document.documentElement.setAttribute(
        "data-theme",
        this.theme.name
      );
    },

    loadScript: (src, loading = "defer", callback, callbackForced) => loadScript(src, loading, callback, callbackForced),

    init() {
      debugLog("AlpineJS DOM init");
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute(
        "data-theme",
        this.getThemeName()
      );
      window.addEventListener("storage", () => {
        this.getThemeName();
      });
    },
  };
};
