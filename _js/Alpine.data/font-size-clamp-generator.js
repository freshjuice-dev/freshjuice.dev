/* global Alpine Prism */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("fontSizeClampGenerator", () => ({
    // Input values
    minFontSize: 16,
    maxFontSize: 48,
    minViewport: 500,
    maxViewport: 900,
    unit: "px", // Single unit for all inputs
    outputUnit: "rem",

    // Preview
    previewViewportWidth: 1024,
    previewText: "The quick brown fox jumps over the lazy dog",

    // UI state
    successMessage: "",

    // Presets
    presets: {
      body: {
        minFontSize: 16,
        maxFontSize: 20,
        minViewport: 500,
        maxViewport: 900,
        unit: "px",
      },
      h1: {
        minFontSize: 32,
        maxFontSize: 64,
        minViewport: 500,
        maxViewport: 900,
        unit: "px",
      },
      h2: {
        minFontSize: 24,
        maxFontSize: 48,
        minViewport: 500,
        maxViewport: 900,
        unit: "px",
      },
      h3: {
        minFontSize: 20,
        maxFontSize: 32,
        minViewport: 500,
        maxViewport: 900,
        unit: "px",
      },
      small: {
        minFontSize: 12,
        maxFontSize: 16,
        minViewport: 500,
        maxViewport: 900,
        unit: "px",
      },
    },

    // Computed properties
    get generatedCSS() {
      const min = this.convertToUnit(this.minFontSize, this.unit);
      const max = this.convertToUnit(this.maxFontSize, this.unit);
      const slope = this.calculateSlope();
      const intersection = this.calculateIntersection();

      return `clamp(${min}, ${intersection} + ${slope}, ${max})`;
    },

    get cssOutput() {
      return `font-size: ${this.generatedCSS};`;
    },

    get calculationFormula() {
      const minPx = this.convertToPx(this.minFontSize, this.unit);
      const maxPx = this.convertToPx(this.maxFontSize, this.unit);
      const minViewportPx = this.convertViewportToPx(
        this.minViewport,
        this.unit,
      );
      const maxViewportPx = this.convertViewportToPx(
        this.maxViewport,
        this.unit,
      );
      const viewportDiff = maxViewportPx - minViewportPx;
      const fontDiff = maxPx - minPx;

      return `Slope = (${maxPx} - ${minPx}) / (${maxViewportPx} - ${minViewportPx})
       = ${fontDiff} / ${viewportDiff}
       = ${(fontDiff / viewportDiff).toFixed(4)}

Intersection = ${minPx} - (Slope × ${minViewportPx})
             = ${minPx} - (${(fontDiff / viewportDiff).toFixed(4)} × ${minViewportPx})
             = ${(minPx - (fontDiff / viewportDiff) * minViewportPx).toFixed(4)}px

Final Formula:
font-size: clamp(
  ${this.convertToUnit(this.minFontSize, this.unit)},
  ${this.calculateIntersection()} + ${this.calculateSlope()},
  ${this.convertToUnit(this.maxFontSize, this.unit)}
);`;
    },

    get currentPreviewSize() {
      const minPx = this.convertToPx(this.minFontSize, this.unit);
      const maxPx = this.convertToPx(this.maxFontSize, this.unit);
      const minViewportPx = this.convertViewportToPx(
        this.minViewport,
        this.unit,
      );
      const maxViewportPx = this.convertViewportToPx(
        this.maxViewport,
        this.unit,
      );

      // Calculate current size based on viewport
      if (this.previewViewportWidth <= minViewportPx) {
        return this.convertToUnit(this.minFontSize, this.unit);
      }
      if (this.previewViewportWidth >= maxViewportPx) {
        return this.convertToUnit(this.maxFontSize, this.unit);
      }

      // Linear interpolation
      const progress =
        (this.previewViewportWidth - minViewportPx) /
        (maxViewportPx - minViewportPx);
      const currentPx = minPx + (maxPx - minPx) * progress;

      return this.pxToOutputUnit(currentPx);
    },

    get previewFontSize() {
      const minPx = this.convertToPx(this.minFontSize, this.unit);
      const maxPx = this.convertToPx(this.maxFontSize, this.unit);
      const minViewportPx = this.convertViewportToPx(
        this.minViewport,
        this.unit,
      );
      const maxViewportPx = this.convertViewportToPx(
        this.maxViewport,
        this.unit,
      );

      // Calculate current size based on viewport
      if (this.previewViewportWidth <= minViewportPx) {
        return `${minPx}px`;
      }
      if (this.previewViewportWidth >= maxViewportPx) {
        return `${maxPx}px`;
      }

      // Linear interpolation
      const progress =
        (this.previewViewportWidth - minViewportPx) /
        (maxViewportPx - minViewportPx);
      const currentPx = minPx + (maxPx - minPx) * progress;

      return `${currentPx.toFixed(2)}px`;
    },

    // Methods
    calculateSlope() {
      const minPx = this.convertToPx(this.minFontSize, this.unit);
      const maxPx = this.convertToPx(this.maxFontSize, this.unit);
      const minViewportPx = this.convertViewportToPx(
        this.minViewport,
        this.unit,
      );
      const maxViewportPx = this.convertViewportToPx(
        this.maxViewport,
        this.unit,
      );
      const viewportDiff = maxViewportPx - minViewportPx;
      const fontDiff = maxPx - minPx;

      const slopeValue = (fontDiff / viewportDiff) * 100;

      // Slope should always be in vw (viewport width units)
      return `${parseFloat(slopeValue.toFixed(4))}vw`;
    },

    calculateIntersection() {
      const minPx = this.convertToPx(this.minFontSize, this.unit);
      const maxPx = this.convertToPx(this.maxFontSize, this.unit);
      const minViewportPx = this.convertViewportToPx(
        this.minViewport,
        this.unit,
      );
      const maxViewportPx = this.convertViewportToPx(
        this.maxViewport,
        this.unit,
      );
      const viewportDiff = maxViewportPx - minViewportPx;
      const fontDiff = maxPx - minPx;
      const slope = fontDiff / viewportDiff;

      const intersectionPx = minPx - slope * minViewportPx;

      return this.pxToOutputUnit(intersectionPx);
    },

    convertToPx(value, unit) {
      if (unit === "rem" || unit === "em") {
        return value * 16; // Assuming 1rem = 16px
      }
      return value;
    },

    convertViewportToPx(value, unit) {
      if (unit === "rem") {
        return value * 16; // Assuming 1rem = 16px
      }
      return value;
    },

    convertToUnit(value, fromUnit) {
      const px = this.convertToPx(value, fromUnit);
      return this.pxToOutputUnit(px);
    },

    pxToOutputUnit(px) {
      if (this.outputUnit === "rem") {
        return `${parseFloat((px / 16).toFixed(4))}rem`;
      } else if (this.outputUnit === "em") {
        return `${parseFloat((px / 16).toFixed(4))}em`;
      } else {
        return `${parseFloat(px.toFixed(2))}px`;
      }
    },

    applyPreset(presetName) {
      const preset = this.presets[presetName];
      if (preset) {
        this.minFontSize = preset.minFontSize;
        this.maxFontSize = preset.maxFontSize;
        this.minViewport = preset.minViewport;
        this.maxViewport = preset.maxViewport;
        this.unit = preset.unit;

        debugLog(`Applied preset: ${presetName}`, preset);

        // Reset preview viewport to middle of range
        const minViewportPx = this.convertViewportToPx(
          this.minViewport,
          this.unit,
        );
        const maxViewportPx = this.convertViewportToPx(
          this.maxViewport,
          this.unit,
        );
        this.previewViewportWidth = Math.floor(
          (minViewportPx + maxViewportPx) / 2,
        );

        // Trigger Prism highlighting after preset applied
        this.highlightPrism();
      }
    },

    async copyToClipboard() {
      debugLog("Copying CSS to clipboard");
      try {
        await navigator.clipboard.writeText(this.cssOutput);
        this.successMessage = "✓ CSS copied to clipboard!";
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      } catch (err) {
        debugLog("Clipboard error:", err);
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = this.cssOutput;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          this.successMessage = "✓ CSS copied to clipboard!";
          setTimeout(() => {
            this.successMessage = "";
          }, 3000);
        } catch (e) {
          debugLog("Fallback copy failed:", e);
        }
        document.body.removeChild(textarea);
      }
    },

    highlightPrism() {
      try {
        if (window.Prism && typeof window.Prism.highlightAll === "function") {
          this.$nextTick(() => {
            window.Prism.highlightAll();
          });
        }
      } catch (e) {
        debugLog("Prism highlighting error:", e);
      }
    },

    init() {
      debugLog("Font Size Clamp Generator initialized");

      // Set initial preview viewport to middle of range (in px)
      const minViewportPx = this.convertViewportToPx(
        this.minViewport,
        this.unit,
      );
      const maxViewportPx = this.convertViewportToPx(
        this.maxViewport,
        this.unit,
      );
      this.previewViewportWidth = Math.floor(
        (minViewportPx + maxViewportPx) / 2,
      );

      // Initial Prism highlighting
      this.highlightPrism();

      // Watch for changes to trigger Prism highlighting
      this.$watch("minFontSize", () => this.highlightPrism());
      this.$watch("maxFontSize", () => this.highlightPrism());
      this.$watch("minViewport", () => this.highlightPrism());
      this.$watch("maxViewport", () => this.highlightPrism());
      this.$watch("outputUnit", () => this.highlightPrism());

      // Watch for unit changes and convert values
      let previousUnit = this.unit;
      this.$watch("unit", (newUnit) => {
        debugLog(`Unit changed from ${previousUnit} to ${newUnit}`);

        // Convert all numeric values when switching units
        if (previousUnit === "px" && newUnit === "rem") {
          // Convert px to rem (divide by 16)
          this.minFontSize = parseFloat((this.minFontSize / 16).toFixed(4));
          this.maxFontSize = parseFloat((this.maxFontSize / 16).toFixed(4));
          this.minViewport = parseFloat((this.minViewport / 16).toFixed(4));
          this.maxViewport = parseFloat((this.maxViewport / 16).toFixed(4));
        } else if (previousUnit === "rem" && newUnit === "px") {
          // Convert rem to px (multiply by 16)
          this.minFontSize = Math.round(this.minFontSize * 16);
          this.maxFontSize = Math.round(this.maxFontSize * 16);
          this.minViewport = Math.round(this.minViewport * 16);
          this.maxViewport = Math.round(this.maxViewport * 16);
        }

        // Update previous unit for next change
        previousUnit = newUnit;

        // Recalculate preview viewport
        const minVpPx = this.convertViewportToPx(this.minViewport, this.unit);
        const maxVpPx = this.convertViewportToPx(this.maxViewport, this.unit);
        this.previewViewportWidth = Math.floor((minVpPx + maxVpPx) / 2);

        // Trigger Prism highlighting after unit conversion
        this.highlightPrism();
      });
    },
  }));
});
