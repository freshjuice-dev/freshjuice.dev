---
layout: prose
title: Changelog
permalink: /developer-edition/changelog/
---

# {{ title }}

**_= 3.0.0 - August 14, 2025 =_**

- Renamed theme to **FreshJuice DEV (Developer Edition)** and updated all references, including repository structure and build scripts
- Version bumped to **3.0.0** to reflect major changes
- Updated Node.js prerequisite to **v22.0.0**
- **Upgraded TailwindCSS from v3.x to v4.0.0** with zero-config setup (breaking change — review [Tailwind v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide))
- Removed `fj-` prefix from CSS classes for naming consistency
- Added new CSS utilities for margins, text colors, and hover effects
- Improved style consistency across components
- Enhanced JavaScript MutationObserver to handle DOM changes more efficiently
- Added helper functions `isCheckbox` and `isRadio` for cleaner code reuse
- Updated `initTree` and `destroyTree` logic for better DOM manipulation and memory handling
- Removed unused configuration files: `tailwind.config.js` and `postcss.config.js`
- Updated dependencies in `package.json` and `package-lock.json`
- Bumped **esbuild** to `0.25.9`

**_= 2.0.0 - September 20, 2024 =_**

- Updated license to MIT
- New Flip Cards Module
- Big Refactor to Card and Button modules
- Update styling and layout for some modules
- Fix Bug [#9](https://github.com/freshjuice-dev/freshjuice-hubspot-theme/issues/9)
- Fix Bug [#22](https://github.com/freshjuice-dev/freshjuice-hubspot-theme/pull/22)
- Fixed Scroll to top Module incorrect strolling percentage
- Fixed Navigation Bar Module Dropdowns for mobile devices

**_= 1.17.0 - August 5, 2024 =_**

- Update templates and sections
- update theme image previews
- update to some modules
- Fix Bug [#8](https://github.com/freshjuice-dev/freshjuice-hubspot-theme/issues/8)
- Fix Bug [#10](https://github.com/freshjuice-dev/freshjuice-hubspot-theme/issues/10)
- New Social Icons Module

**_= 1.16.1 - July 11, 2024 =_**

- Fixed a bug in the pricing card module
- Global cleanup

**_= 1.16.0 - May 30, 2024 =_**

- Added more modules:
  - Pricing Cards
  - Price Card with details
  - Stats Simple
  - Stats Simple Grid
  - Stats Timeline
- UI optimisations

**_= 1.11.0 - May 26, 2024 =_**

- Added new modules

**_= 1.1.0 - April 29, 2024 =_**

- Fixed text balance for safari browsers
- Added new modules
- Optimizing exists modules
- Minor bug fixes

**_= 1.0.0 - April 1, 2024 =_**

- Initial release
