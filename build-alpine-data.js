// build-alpine-data.js
import { readdirSync } from "fs";
import { spawn } from "child_process";
import path from "path";

const dir = "./_js/Alpine.data";
const outDir = "./_site/js/alpine.data";
const mode = process.argv[2] === "watch" ? "watch" : "build";

const files = readdirSync(dir).filter((f) => f.endsWith(".js"));

for (const file of files) {
  const input = path.join(dir, file);
  const output = path.join(outDir, file);
  const args = [
    input,
    `--outfile=${output}`,
    "--bundle",
    ...(mode === "build" ? ["--minify"] : ["--watch", "--sourcemap"]),
  ];

  console.log(`🚀 ${mode.toUpperCase()} → ${file}`);
  spawn("npx", ["esbuild", ...args], { stdio: "inherit" });
}
