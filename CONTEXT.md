# CONTEXT.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the official website for FreshJuice, a HubSpot CMS theme. Built with Eleventy 3.x, it uses git submodules for content management, modern tooling (Tailwind CSS v4, Alpine.js, esbuild), and client-side search via Pagefind.

## Essential Commands

### Development

```bash
npm start                    # Start dev server with live reload (includes drafts)
npm run debug:11ty           # Dev with Eleventy debug logging
npm run debugstart           # Dev with full debug output
```

### Building

```bash
npm run build                # Full production build (sequential)
npm run clean:site           # Remove _site/ and _temp/ directories
```

### Submodule Management

```bash
npm run submodules:pull      # Initialize submodules (git submodule update --init)
npm run submodules:merge     # Update to latest remote (git submodule update --remote --merge)
```

### Utilities

```bash
npm run make:og-images       # Generate Open Graph images from _temp/titles-for-og-images.json
npm run prettier:check       # Check code formatting
npm run prettier:fix         # Auto-fix formatting
npm run view:twconfig        # Open Tailwind config viewer
npm run benchmark            # Run Eleventy with benchmark logging
```

**Important:** There are no tests in this project currently.

## Architecture Overview

### Multi-Stage Build System

The build process runs four parallel bundlers:

1. **Eleventy** - Processes Markdown/Nunjucks → HTML
2. **esbuild (main.js)** - Bundles `_js/main.js` → `_site/js/main.js`
3. **esbuild (Alpine.data)** - Bundles each `_js/Alpine.data/*.js` → separate files in `_site/js/alpine-data/`
4. **PostCSS/Tailwind** - Processes `_css/main.css` → `_site/css/main.css`

After build, two Pagefind indexes are generated for search: one for `/docs` and one for `/developer-edition/docs`.

### Modular Eleventy Configuration

`eleventy.config.js` imports configuration from `_11ty/`:

- `plugins.js` - Image optimization, RSS, syntax highlighting, drafts support, etc.
- `filters.js` - 30+ filters (date formatting, author data, breadcrumbs, etc.)
- `shortcodes.js` - Image optimization, YouTube embeds, OG images, author signatures
- `transforms.js` - External link enhancement (utm_source), HTML minification
- `amendLibraries.js` - Markdown-it customizations and heading slugification
- `passthrough.js` - Static file copying rules
- `watchTargets.js` - Additional file watching patterns

### Git Submodules for Content

**Critical:** Blog posts and authors are managed in separate repositories:

```
_content/blog/posts/     → git@github.com:freshjuice-dev/blog.freshjuice.dev.git
_content/authors/authors/ → git@github.com:freshjuice-dev/authors.freshjuice.dev.git
```

Always run `npm run submodules:pull` or `npm run submodules:merge` before working with blog/author content. The Cloudflare build script (`cloudflare-build.sh`) handles SSH authentication using the `CLOUDFLARE_SUBMODULE_SSH_KEY` environment variable.

### Data Cascade Pattern

Content directories use `.11tydata.js` files for directory-level configuration:

- `blog.11tydata.js` - Sets tags: ["posts"], layout: "post", custom permalinks
- `authors.11tydata.js` - Sets tags: ["authors"], layout: "author"
- `docs.11tydata.js` - Sets tags: ["docs"], layout: "docs"

This creates Eleventy collections automatically via tags.

### Draft System

Posts with `draft: true` frontmatter:

- **Included** in development (`npm start` sets `BUILD_DRAFTS=true`)
- **Excluded** from production builds
- Implemented via DraftsSupport plugin in `_11ty/plugins.js`

### Image Optimization Pipeline

Two-stage process:

1. **Automatic Transform** - The eleventy-img transform plugin processes all `<img>` tags in HTML output:

- Generates responsive sizes: 320, 640, 960, 1200px
- Creates AVIF, WebP, and original formats
- Adds lazy loading and sizes attributes
- Caches in `.cache/@11ty/img/` for fast rebuilds
- Copies to `_site/img/` via `eleventy.after` event

2. **Manual Shortcode** - For explicit control in templates:
   ```liquid
   {% image "./path/to/image.jpg", "Alt text", [320, 640], "custom-class" %}
   ```

**Important:** The image cache significantly speeds up rebuilds. Don't delete `.cache/@11ty/img/` unless necessary.

### External Link Enhancement

The transform in `_11ty/transforms.js` automatically modifies all external links:

- Adds `?utm_source=freshjuice.dev` query parameter
- Sets `target="_blank"`
- Adds `rel="noopener"`

This is production-only behavior controlled by `ELEVENTY_ENV`.

### Open Graph Image Generation

Run `npm run make:og-images` to generate OG images:

- Reads metadata from `_temp/titles-for-og-images.json`
- Generates dynamic gradient backgrounds (14 color schemes)
- Includes Gravatar integration for author pages
- Outputs to `_static/img/og/{slug}.png`
- **Automatically triggered** in Husky pre-commit hook

### Search Implementation

Client-side search via Pagefind:

- Two separate indexes: `/docs` and `/developer-edition/docs`
- Built after Eleventy via `postbuild:pagefind-*` scripts
- Alpine.js integration in `_js/main.js` (xDOM.docs data object)
- Keyboard shortcuts: Cmd/Ctrl+K to open, ESC to close
- Custom result processing for same-page anchor links

### Author System

Authors are:

- Stored as markdown files in `_content/authors/authors/` (submodule)
- Core authors: reatlat, zapalblizh, atenlotrad, loraider259
- Enhanced with Gravatar integration (`gravatar-gen` package)
- Accessed via `getAuthorData` filter in templates
- Used in blog posts via `author: slug` frontmatter

### Menu Configuration

Navigation menus are YAML files in `_data/menu/`:

- `main.yaml` - Primary navigation
- `footer.yaml`, `footerSitemap.yaml` - Footer links
- `docs.yaml`, `devDocs.yaml` - Documentation sidebars

Processed via js-yaml as a data extension.

### CSS Architecture

Tailwind CSS v4 with new `@source` directive syntax:

```css
@source "../_content/**/*.{md,njk}";
@source "../_js/**/*.js";
```

This scans content files for class usage instead of traditional JIT mode.

Custom theme configuration:

- Font: GeneralSans (variable weight, WOFF2, served from `_static/fonts/`)
- Breakpoints: xxs (360px), xs (490px), + defaults
- Custom z-index: 60, 70, 80, 90, 100
- PostCSS nested syntax for component styles

### Alpine.js Integration

Global `xDOM` Alpine data object in `_js/main.js` handles:

- Mobile drawer navigation
- Documentation search (Pagefind)
- Overlay management
- Keyboard shortcuts
- Dynamic script loading for search assets

Alpine.js data modules in `_js/Alpine.data/` are bundled separately per file for code splitting.

## Key Files and Directories

### Configuration

- `eleventy.config.js` - Main Eleventy config (imports from `_11ty/`)
- `postcss.config.js` - PostCSS/Tailwind processing
- `.editorconfig` - 2-space indents, LF line endings, UTF-8
- `.nvmrc` - Node version: 22

### Content Structure

- `_content/blog/posts/` - Blog posts (submodule, has its own CLAUDE.md)
- `_content/authors/authors/` - Author profiles (submodule)
- `_content/docs/` - Main documentation
- `_content/developer-edition/` - Developer documentation
- `_content/tools/` - Tools pages

### Data

- `_data/build.js` - Build metadata (git hash, timestamps, environment)
- `_data/hsTheme.js` - HubSpot theme metadata (async fetch from GitHub)
- `_data/metadata.js` - Site metadata
- `_data/menu/` - YAML menu structures

### Assets

- `_static/` - Static assets (copied to root of `_site/`)
- `_css/` - CSS source (Tailwind v4)
- `_js/` - JavaScript source
- `.cache/@11ty/img/` - Image optimization cache

### Templates

- `_layouts/` - Layout templates (base, page, post, author, docs, etc.)
- `_includes/partials/` - Reusable components

### Build Scripts

- `cloudflare-build.sh` - Cloudflare Pages deployment (handles SSH for submodules)
- `build-alpine-data.js` - Custom Alpine.js bundler
- `generate-og-images.js` - OG image generator (uses node-html-to-image)

### Output

- `_site/` - Build output (not committed)
- `_temp/` - Temporary build files (not committed)

## Environment Variables

- `ELEVENTY_ENV` - Controls production vs development (affects minification, drafts)
- `BUILD_DRAFTS` - Auto-set in dev mode, controls draft visibility
- `CLOUDFLARE_SUBMODULE_SSH_KEY` - Required for submodule access in CI/CD

## Content Authoring

### Blog Post Frontmatter

```yaml
---
title: String (required)
desc: String (meta description, required)
tags: Array (categories, required)
author: String (author slug, required)
date: ISO 8601 datetime (required)
permalink: String (custom URL, optional)
draft: Boolean (optional, excludes from production)
uuid: String (unique identifier for canonical tracking)
---
```

See `_content/blog/posts/CLAUDE.md` for detailed content authoring guidelines.

## Important Notes

1. **No Testing Framework:** This project has no test infrastructure currently (`npm test` is not implemented).

2. **Pre-commit Hook:** Husky runs `pretty-quick --staged` and `npm run make:og-images` automatically before commits.

3. **Markdown Heading Slugs:** Custom slugify removes leading numbers from heading IDs to prevent issues with headings like "01. Introduction".

4. **Passthrough Copy:** `_static/` is copied to the root of `_site/`, and video assets from blog posts are copied to `/video/`.

5. **Watch Targets:** Eleventy watches media files (`*.svg`, `*.webp`, `*.png`, `*.jpeg`, `*.mp4`) and triggers rebuilds when they change.

6. **HTML Minification:** Only runs in production (`ELEVENTY_ENV=production`). Also minifies JSON and XML files, but preserves `application/ld+json` scripts for SEO.

7. **Speculation Rules:** The Speculation Rules plugin automatically adds prefetch rules for faster navigation (leverages Chrome's speculation rules API).

8. **YouTube Embeds:** Uses `lite-youtube-embed` web component for lazy loading. Shortcode: `{% youtube "VIDEO_ID" %}`.

9. **Table Responsiveness:** Custom `<table-saw>` web component from @zachleat/table-saw makes tables horizontally scrollable on mobile.

10. **Phosphor Icons:** Available via `{% phicon "icon-name", 32 %}` shortcode. Default size: 32px.

## License

Codebase: MIT License
Content (`_content/`): Creative Commons Attribution 4.0 License

© 2025 Alex Zappa (@reatlat). All Rights Reserved.
