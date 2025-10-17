/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("LoremIpsum", () => ({
    // UI state
    size: 2,
    mode: "paragraphs", // 'words' | 'lists'
    outputStyle: "plain", // 'html' | 'plain'
    copySuccess: false,
    resultHtml:
      "<p>Lorem ipsum dolor sit amet consectetur adipiscing elit faucibus tristique arcu condimentum, ullamcorper etiam fermentum ultrices integer ultricies turpis hac natoque volutpat. Feugiat elementum egestas pulvinar quam sociis arcu condimentum volutpat, libero aenean aliquet placerat ultrices orci sociosqu litora sapien, nunc tellus auctor morbi metus erat viverra. Odio venenatis vestibulum pretium viverra lacinia senectus, tempus lacus primis massa vitae sollicitudin, mus mauris suspendisse aptent ultricies.</p><p>Ornare porttitor nullam orci accumsan himenaeos libero sapien sem a praesent augue luctus, facilisis commodo scelerisque imperdiet venenatis arcu montes dictumst enim sociis risus. Id nunc nisl parturient scelerisque nibh inceptos varius fames fermentum, cum at litora integer eget sollicitudin lectus nulla, diam molestie ad class sociis volutpat suspendisse porttitor.</p>",

    // ======== internal generator (no imports) ========
    _openingWords: [
      "lorem",
      "ipsum",
      "dolor",
      "sit",
      "amet",
      "consectetur",
      "adipiscing",
      "elit",
    ],
    _dict: [
      "a",
      "ac",
      "accumsan",
      "ad",
      "aenean",
      "aliquam",
      "aliquet",
      "ante",
      "aptent",
      "arcu",
      "at",
      "auctor",
      "augue",
      "bibendum",
      "blandit",
      "class",
      "commodo",
      "condimentum",
      "congue",
      "consequat",
      "conubia",
      "convallis",
      "cras",
      "cubilia",
      "cum",
      "curabitur",
      "curae",
      "cursus",
      "dapibus",
      "diam",
      "dictum",
      "dictumst",
      "dignissim",
      "dis",
      "donec",
      "dui",
      "duis",
      "egestas",
      "eget",
      "eleifend",
      "elementum",
      "enim",
      "erat",
      "eros",
      "est",
      "et",
      "etiam",
      "eu",
      "euismod",
      "facilisi",
      "facilisis",
      "fames",
      "faucibus",
      "felis",
      "fermentum",
      "feugiat",
      "fringilla",
      "fusce",
      "gravida",
      "habitant",
      "habitasse",
      "hac",
      "hendrerit",
      "himenaeos",
      "iaculis",
      "id",
      "imperdiet",
      "in",
      "inceptos",
      "integer",
      "interdum",
      "justo",
      "lacinia",
      "lacus",
      "laoreet",
      "lectus",
      "leo",
      "libero",
      "ligula",
      "litora",
      "lobortis",
      "luctus",
      "maecenas",
      "magna",
      "magnis",
      "malesuada",
      "massa",
      "mattis",
      "mauris",
      "metus",
      "mi",
      "molestie",
      "mollis",
      "montes",
      "morbi",
      "mus",
      "nam",
      "nascetur",
      "natoque",
      "nec",
      "neque",
      "netus",
      "nibh",
      "nisi",
      "nisl",
      "non",
      "nostra",
      "nulla",
      "nullam",
      "nunc",
      "odio",
      "orci",
      "ornare",
      "parturient",
      "pellentesque",
      "penatibus",
      "per",
      "pharetra",
      "phasellus",
      "placerat",
      "platea",
      "porta",
      "porttitor",
      "posuere",
      "potenti",
      "praesent",
      "pretium",
      "primis",
      "proin",
      "pulvinar",
      "purus",
      "quam",
      "quis",
      "quisque",
      "rhoncus",
      "ridiculus",
      "risus",
      "rutrum",
      "sagittis",
      "sapien",
      "scelerisque",
      "sed",
      "sem",
      "semper",
      "senectus",
      "sociis",
      "sociosqu",
      "sodales",
      "sollicitudin",
      "suscipit",
      "suspendisse",
      "taciti",
      "tellus",
      "tempor",
      "tempus",
      "tincidunt",
      "torquent",
      "tortor",
      "tristique",
      "turpis",
      "ullamcorper",
      "ultrices",
      "ultricies",
      "urna",
      "ut",
      "varius",
      "vehicula",
      "vel",
      "velit",
      "venenatis",
      "vestibulum",
      "vitae",
      "vivamus",
      "viverra",
      "volutpat",
      "vulputate",
    ],

    _gauss(mean = 0, sd = 1) {
      // Box–Muller transform
      let u = 0,
        v = 0,
        s = 0;
      do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u * u + v * v;
      } while (s === 0 || s >= 1);
      const mul = Math.sqrt((-2 * Math.log(s)) / s);
      return mean + sd * (u * mul);
    },
    _arrayShuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    _wordsArray(count, startWithLorem = false) {
      // Generate an array of words of a given length
      const bag = this._arrayShuffle([...this._dict]);
      let out = [];
      while (out.length < count) {
        // Avoid repeating the same word at the boundary between batches
        const next = this._arrayShuffle([...this._dict]);
        if (out.length === 0 || out[out.length - 1] !== next[0]) {
          out = out.concat(next);
        }
      }
      out = out.slice(0, count);
      if (startWithLorem) out = [...this._openingWords, ...out].slice(0, count);
      return out;
    },
    _punctuate(sentencesTokens) {
      // sentencesTokens: array of sentences, each is an array of words
      return sentencesTokens.map((tokens) => {
        const n = tokens.length;
        if (n > 4) {
          const mean = Math.log(n) / Math.log(6);
          const sd = mean / 6;
          const commas = Math.round(this._gauss(mean, sd));
          for (let i = 1; i <= commas; i++) {
            const w = Math.round((i * n) / (commas + 1));
            if (w > 0 && w < n - 1) tokens[w] = tokens[w] + ",";
          }
        }
        // Capitalize the first letter and end with a period
        let s = tokens.join(" ");
        s = s.charAt(0).toUpperCase() + s.slice(1);
        if (!/[.!?]$/.test(s)) s += ".";
        return s;
      });
    },
    _sentencise(wordList) {
      // Split wordList into sentences with lengths distributed as N(24.46, 5.08)
      if (!wordList.length) return [];
      let begin = 0;
      let end = Math.min(Math.round(this._gauss(24.46, 5.08)), wordList.length);
      const sentences = [];
      // Capitalize the first word
      wordList[0] = wordList[0].charAt(0).toUpperCase() + wordList[0].slice(1);
      while (begin < wordList.length) {
        if (wordList.length !== end && wordList.length - end < 6)
          end = wordList.length;
        sentences.push(wordList.slice(begin, end));
        begin = end;
        end = Math.min(
          begin + Math.round(this._gauss(24.46, 5.08)),
          wordList.length,
        );
      }
      return this._punctuate(sentences);
    },
    _sentences(count, startWithLorem = false) {
      // Return a string containing 'count' sentences
      let out = [];
      for (let i = 0; i < count; i++) {
        const tokens = this._wordsArray(
          Math.round(this._gauss(24.46, 5.08)),
          startWithLorem,
        );
        startWithLorem = false;
        const sents = this._sentencise(tokens);
        out.push(...sents);
      }
      return out.join(" ");
    },
    _paragraphs(count, startWithLorem = false) {
      // Return an array of paragraphs, each with ~N(5.8, 1.93) sentences
      const paras = [];
      for (let i = 0; i < count; i++) {
        const sentencesCount = Math.max(1, Math.round(this._gauss(5.8, 1.93)));
        const p = this._sentences(sentencesCount, startWithLorem);
        startWithLorem = false;
        paras.push(p);
      }
      return paras;
    },
    _listsArray(count, startWithLorem = false) {
      // Return an array of list items, each ~N(9.3, 1.24) words, then sentencise+punctuate
      const items = [];
      for (let i = 0; i < count; i++) {
        const tokens = this._wordsArray(
          Math.max(1, Math.round(this._gauss(9.3, 1.24))),
          startWithLorem,
        );
        startWithLorem = false;
        const s = this._sentencise(tokens)[0] || "";
        items.push(s);
      }
      return items;
    },

    // ======== UI helpers ========
    _clampSize() {
      if (isNaN(this.size) || this.size < 1) this.size = 1;
      if (this.size > 100) this.size = 100;
    },
    setSize(direction) {
      if (direction === "plus") this.size++;
      else if (direction === "minus") this.size--;
      this._clampSize();
      this.generateText();
    },
    setMode(m) {
      this.mode = m;
      this.generateText();
    },
    resultHtmlRaw(html) {
      return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
    copyToClipboard() {
      let textToCopy = this.resultHtml;
      if (this.outputStyle === "plain") {
        textToCopy = textToCopy
          .replace(/<p>/g, "\n\n")
          .replace(/<\/p>/g, "")
          .replace(/<li>/g, "\n- ")
          .replace(/<\/li>/g, "")
          .replace(/<ul>/g, "\n")
          .replace(/<\/ul>/g, "")
          .replace(/<[^>]+>/g, "") // remove any other HTML tags
          .trim();
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        debugLog("Copied to clipboard");
        this.copySuccess = true;
        setTimeout(() => {
          this.copySuccess = false;
        }, 2500);
      });
    },

    // ======== generation logic for each mode ========
    generateText() {
      this._clampSize();

      if (this.mode === "paragraphs") {
        const paras = this._paragraphs(this.size, true); // start with 'Lorem ...'
        this.resultHtml = paras.map((p) => `<p>${p}</p>`).join("");
        return;
      }

      if (this.mode === "words") {
        const words = this._wordsArray(this.size, true).join(" ");
        this.resultHtml = `<p>${words}</p>`;
        return;
      }

      if (this.mode === "lists") {
        const items = this._listsArray(this.size, true)
          .map((li) => `<li>${li}</li>`)
          .join("");
        this.resultHtml = `<ul>${items}</ul>`;
        return;
      }

      this.resultHtml = "<p>Lorem ipsum dolor sit amet…</p>";
    },

    init() {
      debugLog("Lorem Ipsum generator initialized");
      // this.generateText();
    },
  }));
});
