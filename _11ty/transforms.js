// import { generate as criticalGenerate } from 'critical';
import { minify as minifyHTML } from "html-minifier-terser";
import { parseHTML } from "linkedom";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";

// Load additional Prism languages for syntax highlighting
loadLanguages([
  "css",
  "javascript",
  "markup",
  "json",
  "bash",
  "yaml",
  "markdown",
]);

export default {
  //
  // critical: async function (content, outputPath) {
  //   if (
  //     process.env.ELEVENTY_ENV === "production" &&
  //     outputPath && outputPath.endsWith(".html")
  //   ) {
  //     try {
  //       const { html } = await criticalGenerate({
  //         base: `_site/`,
  //         html: content,
  //         inline: true,
  //         extract: true,
  //         // height: 1980,
  //         // width: 1920,
  //         dimensions: [
  //           {
  //             height: 896,
  //             width: 414,
  //           },
  //           {
  //             height: 1900,
  //             width: 1920,
  //           },
  //         ]
  //       });
  //       return html;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  //   return content;
  // },

  externalLinks: function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      const { document } = parseHTML(content);
      const anchors = document.querySelectorAll("a[href^='http']");
      anchors.forEach((el) => {
        const href = el.getAttribute("href");
        try {
          const url = new URL(href);
          if (!url.hostname.includes("freshjuice.dev")) {
            url.searchParams.set("utm_source", "freshjuice.dev");
            let existingRel = (el.getAttribute("rel") || "").split(" ");
            if (!existingRel.includes("noopener")) {
              existingRel.push("noopener");
            }
            el.setAttribute("href", url.toString());
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", existingRel.join(" ").trim());
          }
        } catch (err) {}
      });
      content = document.toString();
    }
    return content;
  },

  prismHighlight: function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      const { document } = parseHTML(content);
      const preBlocks = document.querySelectorAll("pre[data-prismjs]");

      preBlocks.forEach((preElement) => {
        // Find the <code> element inside <pre>
        const codeElement = preElement.querySelector("code");
        if (!codeElement) return;

        // Get the code content from the <code> element
        const code = codeElement.textContent || "";

        // Extract language from class on <pre> or <code>
        const preClass = preElement.getAttribute("class") || "";
        const codeClass = codeElement.getAttribute("class") || "";
        const className = preClass + " " + codeClass;
        const languageMatch = className.match(/language-(\w+)/);
        const language = languageMatch ? languageMatch[1] : "txt";

        // Map some common language aliases
        const languageMap = {
          txt: "plaintext",
          html: "markup",
          xml: "markup",
          svg: "markup",
        };

        const prismLanguage = languageMap[language] || language;

        // Highlight if language is available
        if (Prism.languages[prismLanguage]) {
          try {
            const highlighted = Prism.highlight(
              code,
              Prism.languages[prismLanguage],
              prismLanguage,
            );
            // Replace innerHTML of <code>, keeping the <code> element itself
            codeElement.innerHTML = highlighted;
            // Remove the data-prismjs attribute from <pre> after processing
            preElement.removeAttribute("data-prismjs");
          } catch (err) {
            console.error(
              `Prism highlighting error for language ${prismLanguage}:`,
              err.message,
            );
          }
        }
      });

      content = document.toString();
    }
    return content;
  },

  minifyHTML: function (content, outputPath) {
    if (process.env.ELEVENTY_ENV === "production" && outputPath) {
      if (outputPath.endsWith(".json")) {
        return JSON.stringify(JSON.parse(content));
      }
      if (outputPath.endsWith(".html") || outputPath.endsWith(".xml")) {
        return minifyHTML(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          conservativeCollapse: true,
          minifyJS: true,
          minifyCSS: true,
          noNewlinesBeforeTagClose: true,
          keepClosingSlash: true,
          processScripts: ["application/ld+json"],
        });
      }
    }
    return content;
  },
};
