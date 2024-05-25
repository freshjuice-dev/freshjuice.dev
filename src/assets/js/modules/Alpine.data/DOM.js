import debugLog from "../_debugLog";
/* global Prism */

export default () => {
  return {
    theme: {
      dark: true,
      name: "dark",
    },

    prismJson(jsonData, elementId = "responseJson") {
      try {
        document.getElementById(elementId).innerHTML = Prism.highlight(
          JSON.stringify(jsonData, null, 2),
          Prism.languages.json,
          "JSON"
        );
      } catch (error) {
        console.error(error);
        document.getElementById(elementId).innerHTML = error;
      }
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

    init() {
      debugLog("AlpineJS DOM init");
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute(
        "data-theme",
        this.getThemeName()
      );
    },
  };
};
