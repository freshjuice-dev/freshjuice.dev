/* global domReady loadScript loadStylesheet PagefindUI */
import debugLog from "./modules/_debugLog";
import "lite-youtube-embed";
import "@zachleat/table-saw";
import Alpine from "alpinejs";
import intersect from "@alpinejs/intersect";
import collapse from "@alpinejs/collapse";

// The window.Alpine = Alpine bit is optional, but is nice to have for
// freedom and flexibility. Like when tinkering with Alpine from the devtools for example.
window.Alpine = Alpine;

// Add plugins to Alpine
Alpine.plugin(intersect);
Alpine.plugin(collapse);

Alpine.data("xDOM", () => {
  return {
    theme: {
      dark: true,
      name: "dark",
    },
    shortcuts: {
      search:
        navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? "⌘K" : "Ctrl+K",
    },
    drawerOpen: false,
    showOverlay: false,
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
      this.showOverlay = !this.showOverlay;
    },
    closeDrawer() {
      this.drawerOpen = false;
      this.showOverlay = false;
    },
    openDrawer() {
      this.drawerOpen = true;
      this.showOverlay = true;
    },
    docs: {
      showOverlay: false,
      showSearch: false,
      drawerMenuOpen: false,
      searchTerm: "",
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
        if (this.showSearch) {
          this.focusSearch();
        } else {
          this.blurSearch();
        }
      },
      openSearch() {
        this.loadAssets();
        this.showSearch = true;
        this.showOverlay = true;
        this.focusSearch();
      },
      closeSearch() {
        this.showSearch = false;
        this.showOverlay = false;
        this.blurSearch();
      },
      blurSearch() {
        document.querySelector(".pagefind-ui__search-clear").click();
      },
      focusSearch() {
        setTimeout(() => {
          document.querySelector(".pagefind-ui__search-input").focus();
        }, 200);
      },
      loadAssets() {
        debugLog("docsSearch: Loading search assets");
        //loadStylesheet("/docs/pagefind/pagefind-ui.css");
        loadScript("/docs/pagefind/pagefind-ui.js", "defer", () => {
          debugLog("docsSearch: pagefind.js loaded");
          this.pagefind = new PagefindUI({
            element: "#docsSearch",
            showSubResults: true,
            pageSize: 100,
            showImages: false,
            excerptLength: 30,
            resetStyles: true,
            bundlePath: "/docs/pagefind/",
            autofocus: true,
            //debounceTimeoutMs: 500,
            processTerm: (term) => {
              debugLog("docsSearch: Process term", term);
              this.searchTerm = term.length > 0 ? term : "nada";
              return term;
            },
            processResult: (result) => {
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
            },
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
            this.closeSearch();
          }
        });
      },
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
      localStorage.setItem("theme", this.theme.dark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", this.theme.dark);
    },
    init() {
      debugLog("AlpineJS DOM init");
      this.theme.dark =
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      window.addEventListener("storage", () => {
        this.getThemeName();
      });
      // location path starts with /docs
      if (location.pathname.startsWith("/docs")) {
        this.docs.searchInit();
      }
    },
  };
});

domReady(() => {
  // Start Alpine when the page is ready.
  Alpine.start();
});
