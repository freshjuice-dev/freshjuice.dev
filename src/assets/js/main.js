/* global domReady loadScript loadStylesheet */
import "./modules/tracker";

import Alpine from "alpinejs";
import intersect from "@alpinejs/intersect";
import collapse from "@alpinejs/collapse";

import dataDOM from "./modules/Alpine.data/DOM";

// The window.Alpine = Alpine bit is optional, but is nice to have for
// freedom and flexibility. Like when tinkering with Alpine from the devtools for example.
window.Alpine = Alpine;

// Add plugins to Alpine
Alpine.plugin(intersect);
Alpine.plugin(collapse);

Alpine.data("xDOM", dataDOM);

// Start Alpine when the page is ready.
domReady(() => {
  Alpine.start();
});
