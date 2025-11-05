/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags } from "../modules/_sanitize";

// Basic English stopwords list (can be extended)
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "else",
  "when",
  "at",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "onto",
  "to",
  "up",
  "with",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "it",
  "its",
  "that",
  "this",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "they",
  "we",
  "me",
  "him",
  "her",
  "them",
  "us",
  "my",
  "your",
  "his",
  "their",
  "our",
  "mine",
  "yours",
  "hers",
  "theirs",
  "ours",
  "so",
  "not",
  "no",
  "yes",
  "do",
  "does",
  "did",
  "doing",
  "have",
  "has",
  "had",
  "having",
  "over",
  "under",
  "too",
  "very",
  "can",
  "could",
  "should",
  "would",
  "will",
  "just",
]);

function normalizeWhitespace(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitKeywords(raw) {
  const cleaned = normalizeWhitespace(stripTags(raw || ""));
  return cleaned
    .split(/\s*;\s*/)
    .map((k) => k.trim())
    .filter(Boolean);
}

// Tokenize text into lowercase word tokens using Unicode letters/numbers
function tokenize(text) {
  const cleaned = stripTags(String(text ?? ""));
  //const re = /[\p{L}\p{M}\p{Nd}]+/gu; // letters, marks, digits
  const re = /[\p{L}\p{M}\p{Nd}']+/gu; // include apostrophes for contractions
  const tokens = [];
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    tokens.push(m[0].toLowerCase());
  }
  return tokens;
}

function removeStopwords(tokens) {
  return tokens.filter((t) => !STOPWORDS.has(t));
}

function countUnigrams(tokens) {
  const map = new Map();
  for (const t of tokens) map.set(t, (map.get(t) || 0) + 1);
  return map;
}

// Count occurrences of a multi-word phrase (array of lowercased words)
function countPhrase(tokens, phraseWords) {
  if (!phraseWords.length) return 0;
  let count = 0;
  const n = phraseWords.length;
  for (let i = 0; i <= tokens.length - n; i++) {
    let match = true;
    for (let j = 0; j < n; j++) {
      if (tokens[i + j] !== phraseWords[j]) {
        match = false;
        break;
      }
    }
    if (match) count++;
  }
  return count;
}

function percent(num, denom) {
  if (!denom) return 0;
  return (num / denom) * 100;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Compute metrics for keywords (single and multi-word phrases)
function computeKeywordStats(tokens, totalWords, keywords) {
  const unigrams = countUnigrams(tokens);
  const results = [];

  for (const raw of keywords) {
    const norm = raw.toLowerCase();
    const words = tokenize(norm); // reuse tokenizer to split phrase reliably
    if (words.length === 0) continue;

    let occurrences = 0;
    let tokenShareCount = 0;

    if (words.length === 1) {
      occurrences = unigrams.get(words[0]) || 0;
      tokenShareCount = occurrences; // single word contributes 1 token per occurrence
    } else {
      occurrences = countPhrase(tokens, words);
      tokenShareCount = occurrences * words.length; // total tokens matched in phrases
    }

    const density = percent(tokenShareCount, totalWords);

    results.push({
      term: raw,
      words,
      occurrences,
      tokenShareCount,
      density: round2(density),
    });
  }

  // Sort: highest density, then occurrences, then term
  results.sort(
    (a, b) =>
      b.density - a.density ||
      b.occurrences - a.occurrences ||
      a.term.localeCompare(b.term),
  );

  return results;
}

function topWords(unigrams, totalWords, limit = 20) {
  const arr = Array.from(unigrams.entries()).map(([word, count]) => ({
    word,
    count,
    density: round2(percent(count, totalWords)),
  }));
  arr.sort(
    (a, b) =>
      b.density - a.density ||
      b.count - a.count ||
      a.word.localeCompare(b.word),
  );
  return arr.slice(0, limit);
}

function classifyDensity(pct) {
  if (pct >= 3) return { label: ">= 3% (risk of stuffing)", level: "high" };
  if (pct >= 1 && pct <= 2)
    return { label: "1–2% (optimal)", level: "optimal" };
  if (pct > 0) return { label: "< 1%", level: "low" };
  return { label: "0%", level: "none" };
}

document.addEventListener("alpine:init", () => {
  Alpine.data("KeywordDensityChecker", () => ({
    // UI/state
    state: "idle", // idle | analyzing | success | error
    buttonLabel: "Analyze Density",
    errorMessage: "",
    showResults: false,

    // Inputs
    inputText: "",
    keywordsRaw: "",
    excludeStopwords: true,

    // Results
    totalWords: 0,
    uniqueWords: 0,
    wordMap: new Map(),
    topSingles: [],
    keywordStats: [],

    setButtonLabel() {
      switch (this.state) {
        case "analyzing":
          this.buttonLabel = "Analyzing…";
          break;
        case "success":
          this.buttonLabel = "Analyze Again";
          break;
        case "error":
          this.buttonLabel = "Try Again";
          break;
        default:
          this.buttonLabel = "Analyze Density";
      }
    },

    reset() {
      this.inputText = "";
      this.keywordsRaw = "";
      this.excludeStopwords = true;
      this.state = "idle";
      this.errorMessage = "";
      this.showResults = false;
      this.totalWords = 0;
      this.uniqueWords = 0;
      this.wordMap = new Map();
      this.topSingles = [];
      this.keywordStats = [];
      this.setButtonLabel();
    },

    analyze(event) {
      if (event && typeof event.preventDefault === "function")
        event.preventDefault();
      this.errorMessage = "";

      const keywords = splitKeywords(this.keywordsRaw);
      const tokensAll = tokenize(this.inputText);

      let tokens = tokensAll;
      if (this.excludeStopwords) tokens = removeStopwords(tokensAll);

      this.totalWords = tokens.length;
      if (this.totalWords === 0) {
        this.state = "error";
        this.setButtonLabel();
        this.errorMessage = "Please paste some text to analyze.";
        this.showResults = false;
        return;
      }

      this.state = "analyzing";
      this.setButtonLabel();
      this.showResults = false;

      try {
        const unigrams = countUnigrams(tokens);
        this.wordMap = unigrams;
        this.uniqueWords = unigrams.size;
        this.topSingles = topWords(unigrams, this.totalWords, 20);

        this.keywordStats = computeKeywordStats(
          tokens,
          this.totalWords,
          keywords,
        ).map((r) => ({
          ...r,
          classification: classifyDensity(r.density),
        }));

        this.state = "success";
        this.setButtonLabel();
        this.showResults = true;

        // Update query for shareable state (text omitted for brevity; include keywords and stopword setting)
        const params = new URLSearchParams();
        if (keywords.length) params.set("kw", keywords.join("; "));
        if (!this.excludeStopwords) params.set("stop", "0");
        history.replaceState(
          {},
          "",
          `${location.pathname}?${params.toString()}`,
        );

        debugLog(
          `Density: words=${this.totalWords}, unique=${this.uniqueWords}, kw=${keywords.length}`,
        );
      } catch (err) {
        console.error(err);
        this.state = "error";
        this.setButtonLabel();
        this.errorMessage =
          err?.message || "Something went wrong. Please try again.";
        this.showResults = false;
      }
    },

    init() {
      debugLog("Keyword Density Checker initialized");
      // Prefill from query (keywords + stopwords toggle)
      const params = new URLSearchParams(location.search);
      const kw = params.get("kw");
      const stop = params.get("stop");
      if (kw) this.keywordsRaw = kw;
      if (stop === "0") this.excludeStopwords = false;
    },
  }));
});
