/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("ContactForm", (formType) => {
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
            this.fields = {
              firstname: "",
              lastname: "",
              email: "",
              message: "",
            };
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

      init() {
        debugLog("Contact form initialized");

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
    };
  });
});
