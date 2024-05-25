const {DateTime} = require("luxon");
const childProcess = require("child_process");

let timestamp = childProcess
  .execSync("git log -1 --format=%ct")
  .toString()
  .trim();

timestamp = parseInt(timestamp, 10);

const gitHash = childProcess.execSync("git rev-parse HEAD").toString().trim();

module.exports = () => {
  return {
    environment: process.env.ELEVENTY_ENV || "development",
    mode: process.env.MODE,
    url: process.env.ELEVENTY_ENV === "production" ? "https://freshjuice.dev" : "http://localhost:8080",
    timezone: process.env.TIMEZONE || "UTC",
    issues: {
      owner: "freshjuice-dev",
      repo: "freshjuice.dev",
    },
    hash: {
      short: gitHash.slice(0, 7),
      full: gitHash,
    },
    timestamp: {
      raw: timestamp,
      year: DateTime.fromSeconds(timestamp).toUTC().year,
      iso: DateTime.fromSeconds(timestamp).toUTC().toISO(),
      formatted: DateTime.fromSeconds(timestamp)
        .toUTC()
        .toLocaleString(DateTime.DATETIME_FULL),
    },
  };
};
