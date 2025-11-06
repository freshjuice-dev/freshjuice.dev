/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags } from "../modules/_sanitize";

// Utility helpers
function normalizeWhitespace(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text) {
  // Basic sentence splitter that respects common punctuation. Keeps abbreviations simple.
  const cleaned = stripTags(String(text ?? ""));
  const parts = cleaned
    .replace(/[\r\n]+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'\(\[])|(?<=[.!?])$/gm)
    .map((s) => s.trim())
    .filter(Boolean);
  // Fallback: if splitter failed, treat the whole text as one sentence when non-empty
  return parts.length ? parts : cleaned.trim() ? [cleaned.trim()] : [];
}

function tokenizeWords(text) {
  const cleaned = stripTags(String(text ?? ""));
  const re = /[\p{L}\p{M}\p{Nd}'-]+/gu; // words incl. contractions/hyphens
  const tokens = [];
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const w = m[0].toLowerCase();
    // remove starting/ending hyphens or apostrophes
    tokens.push(w.replace(/^["'\-]+|["'\-]+$/g, ""));
  }
  return tokens.filter(Boolean);
}

function countLetters(text) {
  const s = stripTags(String(text ?? ""));
  const m = s.match(/[A-Za-z\p{L}\p{M}]/gu);
  return m ? m.length : 0;
}

function countCharactersForARI(text) {
  const s = stripTags(String(text ?? ""));
  const m = s.match(/[A-Za-z0-9\p{L}\p{M}\p{Nd}]/gu); // letters and numbers
  return m ? m.length : 0;
}

// Syllable counting (heuristic for English)
function countSyllablesInWord(word) {
  if (!word) return 0;
  const w = String(word)
    .toLowerCase()
    .replace(/[^a-z\p{L}\p{M}]/gu, "");
  if (!w) return 0;

  // Common special cases
  const exceptions = new Map([
    ["the", 1],
    ["are", 1],
    ["hour", 1],
    ["our", 1],
    ["fire", 1],
    ["queue", 1],
    ["people", 2],
    ["business", 2],
    ["mrs", 2],
    ["mr", 2],
    ["ms", 1],
  ]);
  if (exceptions.has(w)) return exceptions.get(w);

  // Remove trailing silent 'e'
  const processed = w.replace(/e$/i, "");

  // Count vowel groups
  const matches = processed.match(/[aeiouy\p{M}]{1,}/gi);
  let count = matches ? matches.length : 0;

  // Adjustments
  if (/ia|io|eo|ua|iu/gi.test(processed)) count += 0; // leave diphthongs as groups
  if (processed.length <= 3) count = 1; // very short words likely 1 syllable

  return Math.max(1, count);
}

function countSyllables(words) {
  let total = 0;
  for (const w of words) total += countSyllablesInWord(w);
  return total;
}

function countComplexWords(words) {
  // Complex/polysyllabic words: 3+ syllables; ignore common proper-case heuristic by lowercasing input upstream
  let count = 0;
  for (const w of words) {
    if (countSyllablesInWord(w) >= 3) count++;
  }
  return count;
}

function safeDiv(a, b) {
  a = Number(a) || 0;
  b = Number(b) || 0;
  return b === 0 ? 0 : a / b;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function interpretReadingEase(score) {
  // Flesch Reading Ease interpretation
  if (score >= 90) return { label: "Very easy", level: "very-easy" };
  if (score >= 80) return { label: "Easy", level: "easy" };
  if (score >= 70) return { label: "Fairly easy", level: "fairly-easy" };
  if (score >= 60) return { label: "Standard", level: "standard" };
  if (score >= 50)
    return { label: "Fairly difficult", level: "fairly-difficult" };
  if (score >= 30) return { label: "Difficult", level: "difficult" };
  return { label: "Very difficult", level: "very-difficult" };
}

function interpretGradeLevel(grade) {
  if (grade <= 5) return { label: "Very easy (grade ≤5)", level: "very-easy" };
  if (grade <= 8)
    return { label: "Easy/Standard (grade 6–8)", level: "standard" };
  if (grade <= 12)
    return { label: "Challenging (grade 9–12)", level: "challenging" };
  if (grade <= 16) return { label: "Difficult (college)", level: "difficult" };
  return { label: "Very difficult (professional)", level: "very-difficult" };
}

function makeSuggestions({
  avgSentenceLen,
  complexRatio,
  readingEase,
  gradeFk,
  gradeFog,
  gradeSmog,
}) {
  const suggestions = [];
  if (avgSentenceLen > 20) {
    suggestions.push("Shorten sentences — aim for under 20 words each.");
  }
  if (complexRatio > 0.15) {
    suggestions.push(
      "Replace complex (3+ syllable) words with simpler alternatives where possible.",
    );
  }
  if (readingEase < 60) {
    suggestions.push(
      "Target a Flesch Reading Ease of 60–70 for general audiences.",
    );
  }
  const avgGrade = (gradeFk + gradeFog + gradeSmog) / 3;
  if (avgGrade > 10) {
    suggestions.push("Aim for grade 7–8 to reach a broader audience.");
  }
  if (!suggestions.length) {
    suggestions.push(
      "Great job — your text looks easy to read. Keep sentences concise and vocabulary simple.",
    );
  }
  return suggestions;
}

document.addEventListener("alpine:init", () => {
  Alpine.data("ReadabilityScoreChecker", () => ({
    // UI/state
    inputText: "",
    buttonLabel: "Analyze Readability",
    state: "idle", // idle | analyzing | success | error
    showResults: false,
    errorMessage: "",

    // metrics
    sentences: 0,
    words: 0,
    uniqueWords: 0,
    characters: 0,
    letters: 0,
    syllables: 0,
    complexWords: 0,

    // derived
    avgSentenceLen: 0,
    avgSyllablesPerWord: 0,

    // scores
    readingEase: 0, // Flesch Reading Ease
    fkGrade: 0, // Flesch-Kincaid Grade Level
    fogIndex: 0, // Gunning Fog
    smogIndex: 0,
    colemanLiau: 0,
    ari: 0,

    suggestions: [],

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
          this.buttonLabel = "Analyze Readability";
      }
    },

    reset() {
      this.inputText = "";
      this.state = "idle";
      this.showResults = false;
      this.errorMessage = "";
      this.sentences =
        this.words =
        this.uniqueWords =
        this.characters =
        this.letters =
        this.syllables =
        this.complexWords =
          0;
      this.avgSentenceLen = this.avgSyllablesPerWord = 0;
      this.readingEase =
        this.fkGrade =
        this.fogIndex =
        this.smogIndex =
        this.colemanLiau =
        this.ari =
          0;
      this.suggestions = [];
      this.setButtonLabel();
      this.$nextTick(() => this.$refs?.inputText?.focus?.());
    },

    analyze(event) {
      if (event && typeof event.preventDefault === "function")
        event.preventDefault();
      try {
        const text = normalizeWhitespace(stripTags(this.inputText || ""));
        if (!text) {
          this.state = "error";
          this.errorMessage = "Please enter some text to analyze.";
          this.showResults = false;
          this.setButtonLabel();
          return;
        }

        this.state = "analyzing";
        this.setButtonLabel();
        this.showResults = false;

        // compute
        const sentences = splitSentences(text);
        const words = tokenizeWords(text);
        const wordCount = words.length;
        const uniqueWords = new Set(words).size;
        const letters = countLetters(text);
        const characters = countCharactersForARI(text);
        const syllables = countSyllables(words);
        const complexWords = countComplexWords(words);
        const sentenceCount = sentences.length || (wordCount ? 1 : 0);

        const avgSentenceLen = safeDiv(wordCount, sentenceCount);
        const avgSyllablesPerWord = safeDiv(syllables, wordCount);

        // Scores
        const readingEase =
          206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord;
        const fkGrade =
          0.39 * avgSentenceLen + 11.8 * avgSyllablesPerWord - 15.59;
        const fogIndex =
          0.4 * (avgSentenceLen + 100 * safeDiv(complexWords, wordCount));
        const smogIndex =
          sentenceCount > 0
            ? 1.043 * Math.sqrt(30 * safeDiv(complexWords, sentenceCount)) +
              3.1291
            : 0;
        const L = 100 * safeDiv(letters, wordCount); // letters per 100 words
        const S = 100 * safeDiv(sentenceCount, wordCount); // sentences per 100 words
        const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;
        const ari =
          4.71 * safeDiv(characters, wordCount) + 0.5 * avgSentenceLen - 21.43;

        // assign
        this.sentences = sentenceCount;
        this.words = wordCount;
        this.uniqueWords = uniqueWords;
        this.characters = characters;
        this.letters = letters;
        this.syllables = Math.round(syllables);
        this.complexWords = complexWords;
        this.avgSentenceLen = avgSentenceLen;
        this.avgSyllablesPerWord = avgSyllablesPerWord;
        this.readingEase = readingEase;
        this.fkGrade = fkGrade;
        this.fogIndex = fogIndex;
        this.smogIndex = smogIndex;
        this.colemanLiau = colemanLiau;
        this.ari = ari;

        this.suggestions = makeSuggestions({
          avgSentenceLen,
          complexRatio: safeDiv(complexWords, wordCount),
          readingEase,
          gradeFk: fkGrade,
          gradeFog: fogIndex,
          gradeSmog: smogIndex,
        });

        this.state = "success";
        this.setButtonLabel();
        this.showResults = true;
        debugLog("Readability analyzed");
      } catch (err) {
        console.error(err);
        this.state = "error";
        this.errorMessage =
          err?.message || "Something went wrong. Please try again.";
        this.setButtonLabel();
        this.showResults = false;
      }
    },

    // UI helpers for result labels/colors
    readingEaseInfo() {
      const info = interpretReadingEase(this.readingEase);
      return info;
    },
    gradeInfo(grade) {
      return interpretGradeLevel(grade);
    },

    init() {
      debugLog("Readability Score Checker initialized");
    },
  }));
});
