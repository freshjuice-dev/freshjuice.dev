/**
 * Video fingerprinting for cache busting
 * Creates hashed copies of video files alongside originals
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Cache for video hashes (original path → { hash, hashedPath, sourcePath })
const videoHashCache = new Map();

// Track which videos need to be copied with hashed names
const pendingCopies = new Map();

/**
 * Compute MD5 hash of file content (first 8 chars for brevity)
 */
function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 8);
}

/**
 * Find the source file for a given output path
 * @param {string} outputPath - e.g., "/video/example.mp4"
 * @returns {string|null} - Source file path or null
 */
function findSourceFile(outputPath) {
  // Map output paths to source directories
  const mappings = [
    { prefix: "/video/", srcDir: "_content/blog/posts/posts/assets/video/" },
    { prefix: "/video/", srcDir: "_static/video/" },
  ];

  for (const { prefix, srcDir } of mappings) {
    if (outputPath.startsWith(prefix)) {
      const relativePath = outputPath.slice(prefix.length);
      const sourcePath = path.join(srcDir, relativePath);
      if (fs.existsSync(sourcePath)) {
        return sourcePath;
      }
    }
  }

  return null;
}

/**
 * Get the hashed path for a video (computes on-demand)
 * @param {string} originalPath - Original video path (e.g., "/video/example.mp4")
 * @returns {string} - Hashed path (e.g., "/video/example.a1b2c3d4.mp4")
 */
export function getHashedVideoPath(originalPath) {
  // Normalize the path
  const normalizedPath = originalPath.startsWith("/")
    ? originalPath
    : "/" + originalPath;

  // Check cache first
  if (videoHashCache.has(normalizedPath)) {
    return videoHashCache.get(normalizedPath).hashedPath;
  }

  // Find source file
  const sourcePath = findSourceFile(normalizedPath);
  if (!sourcePath) {
    // Source not found, return original path
    console.warn(`[videoFingerprint] Source not found for: ${normalizedPath}`);
    return normalizedPath;
  }

  // Compute hash
  const hash = computeFileHash(sourcePath);

  // Build hashed path
  const ext = path.extname(normalizedPath);
  const dir = path.dirname(normalizedPath);
  const basename = path.basename(normalizedPath, ext);
  const hashedPath = `${dir}/${basename}.${hash}${ext}`;

  // Store in cache
  const cacheEntry = { hash, hashedPath, sourcePath };
  videoHashCache.set(normalizedPath, cacheEntry);

  // Track for later copying
  pendingCopies.set(hashedPath, sourcePath);

  return hashedPath;
}

/**
 * Copy all pending hashed videos to output directory
 */
function copyHashedVideos(outputDir) {
  for (const [hashedPath, sourcePath] of pendingCopies) {
    const destPath = path.join(outputDir, hashedPath);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(sourcePath, destPath);
  }

  if (pendingCopies.size > 0) {
    console.log(
      `[videoFingerprint] Copied ${pendingCopies.size} hashed video(s)`,
    );
  }
}

export default {
  videoFingerprint: (eleventyConfig) => {
    // Copy hashed videos after build
    eleventyConfig.on("eleventy.after", ({ dir }) => {
      copyHashedVideos(dir.output);
    });

    // Make the lookup function available as a filter
    eleventyConfig.addFilter("videoHash", getHashedVideoPath);
  },
};
