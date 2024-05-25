import "./modules/tracker";

import Alpine from "alpinejs";
import dataDOM from "./modules/Alpine.data/DOM";


// The window.Alpine = Alpine bit is optional, but is nice to have for
// freedom and flexibility. Like when tinkering with Alpine from the devtools for example.
window.Alpine = Alpine;

Alpine.data("xDOM", dataDOM);

// Start Alpine when the page is ready.
window.addEventListener("DOMContentLoaded", () => {
  Alpine.start();
});
