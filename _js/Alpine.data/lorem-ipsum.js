/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("LoremIpsum", (formType) => {
    return {
      size: 2,
      mode: "paragraphs", // 'words' | 'lists'
      outputStyle: "plain", // 'html' | 'plain'
      resultHtml:
        "<p>Lorem ipsum dolor sit amet consectetur adipiscing elit faucibus tristique arcu condimentum, ullamcorper etiam fermentum ultrices integer ultricies turpis hac natoque volutpat. Feugiat elementum egestas pulvinar quam sociis arcu condimentum volutpat, libero aenean aliquet placerat ultrices orci sociosqu litora sapien, nunc tellus auctor morbi metus erat viverra. Odio venenatis vestibulum pretium viverra lacinia senectus, tempus lacus primis massa vitae sollicitudin, mus mauris suspendisse aptent ultricies.</p><p>Ornare porttitor nullam orci accumsan himenaeos libero sapien sem a praesent augue luctus, facilisis commodo scelerisque imperdiet venenatis arcu montes dictumst enim sociis risus. Id nunc nisl parturient scelerisque nibh inceptos varius fames fermentum, cum at litora integer eget sollicitudin lectus nulla, diam molestie ad class sociis volutpat suspendisse porttitor.</p>",
      resultHtmlRaw(textHtml) {
        // escape html as a text
        return textHtml
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      },
      setSize() {
        if (this.size < 1 || isNaN(this.size)) this.size = 1;
        this.generateText();
      },
      setMode(newMode) {
        this.mode = newMode;
        this.generateText();
      },
      generateText() {
        let sampleText = "";
        if (this.mode === "paragraphs") {
          sampleText = Array.from(
            { length: this.size },
            (_, i) => `Paragraph ${i + 1}: Lorem ipsum dolor sit amet...`,
          ).join("\n\n");
        } else if (this.mode === "words") {
          sampleText = Array.from({ length: this.size }, () => "lorem").join(
            " ",
          );
        } else if (this.mode === "lists") {
          sampleText = Array.from(
            { length: this.size },
            (_, i) => `• Item ${i + 1}: lorem ipsum`,
          ).join("\n");
        }
        this.resultHtml = sampleText;
      },
      init() {
        debugLog("Alpine.data LoremIpsum initialized");
      },
    };
  });
});
