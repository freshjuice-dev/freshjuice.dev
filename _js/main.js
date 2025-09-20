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

Alpine.data("contactForm", (formType) => {
  return {
    API_ENDPOINT: "https://api.freshjuice.dev/contact",
    state: "idle", // 'idle' | 'success' | 'failed'
    loading: false,
    error: "",

    fields: {
      firstname: "",
      lastname: "",
      email: "",
      message: "",
    },

    meta: {
      pageUri: "",
      document_title: "",
      referrer: "",
      hutk: "",
      utm_campaign: "",
      utm_source: "",
      utm_medium: "",
      utm_term: "",
      utm_content: "",
    },

    init() {
      this.meta.pageUri = window.location.href;
      this.meta.document_title = document.title || "";
      this.meta.referrer = document.referrer || "";
      this.meta.hutk = this.getCookie("hubspotutk") || "";

      const url = new URL(window.location.href);
      this.meta.utm_campaign = url.searchParams.get("utm_campaign") || "";
      this.meta.utm_source = url.searchParams.get("utm_source") || "";
      this.meta.utm_medium = url.searchParams.get("utm_medium") || "";
      this.meta.utm_term = url.searchParams.get("utm_term") || "";
      this.meta.utm_content = url.searchParams.get("utm_content") || "";
    },

    getCookie(name) {
      const m = document.cookie.match(
        new RegExp("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"),
      );
      return m ? decodeURIComponent(m.pop()) : "";
    },

    reset() {
      this.state = "idle";
      this.loading = false;
      this.error = "";
      this.fields = { firstname: "", lastname: "", email: "", message: "" };
    },

    async submit() {
      this.loading = true;
      this.error = "";

      const payload = {
        form_type: formType || "nada",
        firstname: this.fields.firstname,
        lastname: this.fields.lastname,
        email: this.fields.email,
        message: this.fields.message,

        pageUri: this.meta.pageUri,
        document_title: this.meta.document_title,
        referrer: this.meta.referrer,
        hutk: this.meta.hutk,

        utm_campaign: this.meta.utm_campaign,
        utm_source: this.meta.utm_source,
        utm_medium: this.meta.utm_medium,
        utm_term: this.meta.utm_term,
        utm_content: this.meta.utm_content,
      };

      try {
        const res = await fetch(this.API_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        });
        if (res.status === 202) {
          this.state = "success";
          this.fields = { firstname: "", lastname: "", email: "", message: "" };
        } else {
          let detail = "Submission failed. Please try again.";
          try {
            const data = await res.json();
            detail = data?.detail || data?.message || detail;
          } catch (_) {
            const txt = await res.text().catch(() => "");
            if (txt) detail = txt;
          }
          this.error = detail;
          this.state = "failed";
        }
      } catch (err) {
        this.error = "Network error. Please try again.";
        this.state = "failed";
      } finally {
        this.loading = false;
      }
    },
  };
});

Alpine.data("xDOM", () => {
  return {
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
      docsPath: location.pathname.startsWith("/developer-edition/docs/")
        ? "/developer-edition/docs/"
        : "/docs/",
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
        //loadStylesheet("/developer-edition/docs/pagefind/pagefind-ui.css");
        loadScript(`${this.docsPath}pagefind/pagefind-ui.js`, "defer", () => {
          debugLog("docsSearch: pagefind.js loaded");
          this.pagefind = new PagefindUI({
            element: "#docsSearch",
            showSubResults: true,
            pageSize: 100,
            showImages: false,
            excerptLength: 30,
            resetStyles: true,
            bundlePath: `${this.docsPath}pagefind/`,
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
      searchInit(docsPath) {
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
    init() {
      debugLog("AlpineJS DOM init");
      // location path starts with /docs
      if (
        location.pathname.startsWith("/docs/") ||
        location.pathname.startsWith("/developer-edition/docs/")
      ) {
        this.docs.searchInit();
      }
    },
  };
});

domReady(() => {
  // Start Alpine when the page is ready.
  Alpine.start();

  window._hsp = window._hsp || [];

  const cookieSettings = document.querySelector(`[href="#cookie-settings"]`);
  if (cookieSettings) {
    debugLog("Cookie Settings Link Found");
    cookieSettings.addEventListener("click", (e) => {
      debugLog("Cookie Settings Link Clicked");
      e.preventDefault();
      window._hsp.push(["showBanner"]);
    });
  }
});
