/* global loadScript loadStylesheet PagefindUI */
import debugLog from "../_debugLog";

export default () => {
  return {
    theme: {
      dark: true,
      name: "dark",
    },
    shortcuts: {
      search: navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? "⌘K" : "Ctrl+K",
    },
    docs: {
      showOverlay: false,
      showSearch: false,
      drawerMenuOpen: false,
      pagefind: null,
      toggleDrawerMenu() {
        debugLog("docsSearch: Toggle drawer menu");
        this.showOverlay = !this.showOverlay;
        this.drawerMenuOpen = !this.drawerMenuOpen;
      },
      toggleSearch() {
        this.loadAssets();
        this.showSearch = !this.showSearch;
        this.showOverlay = !this.showOverlay;
      },
      openSearch() {
        this.loadAssets();
        this.showSearch = true;
        this.showOverlay = true;
        setTimeout(() => {
          document.querySelector(".pagefind-ui__search-input").focus();
        }, 200);
      },
      closeSearch() {
        this.showSearch = false;
        this.showOverlay = false;
      },
      loadAssets() {
        debugLog("docsSearch: Loading search assets");
        //loadStylesheet("/docs/pagefind/pagefind-ui.css");
        loadScript("/docs/pagefind/pagefind-ui.js", "defer", () => {
          debugLog("docsSearch: pagefind.js loaded");
          this.pagefind = new PagefindUI({
            element: "#docsSearch",
            showSubResults: true,
            pageSize: 5,
            showImages: false,
            excerptLength: 30,
            resetStyles: false,
            bundlePath: "/docs/pagefind/",
            //debounceTimeoutMs: 500,
            processResult: function (result) {
              debugLog("docsSearch: Process result", result);
              if (result.url === location.pathname) {
                //js open link in same tab
                result.url = location.pathname;
                if (result.anchors) {
                  result.anchors.forEach((anchor) => {
                    anchor.url = `javascript:postMessage({type: 'closeSearch', anchor: '${anchor.id}'})`;
                  });
                }
                if (result.sub_results) {
                  result.sub_results.forEach((sub_result) => {
                    sub_result.url = `javascript:postMessage({type: 'closeSearch', anchor: '${sub_result.url.split("#")[1]}'})`;
                  });
                }
              }
              return result;
            }
          });
        });
      },
      searchInit() {
        debugLog("docsSearch: Init");
        window.addEventListener("message", (e) => {
          if (e.data.type === "closeSearch") {
            this.closeSearch();
            const anchor = document.getElementById(e.data.anchor);
            if (anchor) {
              anchor.scrollIntoView();
            }
          }
        });
        window.addEventListener("keydown", (e) => {
          // add event listener for opening search with CMD/CTRL + K
          if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            this.toggleSearch();
          }
          // add event listener for closing search with ESC
          if (e.key === "Escape") {
            e.preventDefault();
            this.drawerMenuOpen = false;
            this.showSearch = false;
            this.showOverlay = false;
          }
        });
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
      window.addEventListener("storage", () => {
        this.getThemeName();
      });
      // location path startes with /docs
      if (location.pathname.startsWith("/docs")) {
        this.docs.searchInit();
      }
    },
  };
};
