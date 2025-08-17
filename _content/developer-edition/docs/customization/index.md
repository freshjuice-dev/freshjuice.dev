---
title: Customization
desc: Customize your theme to make it your own.
---

FreshJuice is designed to be a flexible and customizable theme that can be tailored to meet your specific needs.

## Customization via HubSpot Design Manager

The easiest way to customize FreshJuice is through the HubSpot Design Manager.
You can access the Design Manager by navigating to `Content` > `Design Manager` in your HubSpot account.

Here are some common customization options you can explore:

1. **Edit CSS:** You can modify the theme's CSS to change the appearance of various elements on your website.
   You can add custom styles, adjust colors, fonts, and spacing to match your brand's identity. \
   We recommend edit only `~/FreshJuice/css/theme-overrides.css` file to avoid conflicts with future updates.
2. **Edit JavaScript:** The `~/FreshJuice/js/main.js` is the main JavaScript file , compiled from `~/source/js/main.js`. \
   We strongly recommend to not edit this file directly. Instead, you can inline JS code using [Alpine.js](/developer-edition/docs/alpinejs/) directives in HubL templates.
3. **Edit Templates:** You can customize the theme's templates to create unique layouts for different pages on your website. You can add or remove modules, rearrange content, and create custom templates to suit your content needs.
4. **Edit Modules:** You can customize individual modules within the theme to add new functionality or modify existing features. You can create custom modules, adjust settings, and style modules to match your design preferences.

## Customization via Local Development (HubSpot CLI)

If you prefer to customize FreshJuice locally (on your machine),
you can use the HubSpot CLI with FreshJuice build tools to make changes to the theme files.

Local Development process requires you to have `Node.JS`, `git`, `HubSpot CLI`, and `jq` installed on your machine.

- If you don't have `Node.JS` installed, you can download it from [here](https://nodejs.org/).
- If you don't have `git` installed, you can download it from [here](https://git-scm.com/).
- If you don't have [HubSpot CLI](https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli) installed, you can install it by running `npm install -g @hubspot/cli` to install the HubSpot CLI globally.
- If you don't have `jq` installed, you can download it from [here](https://stedolan.github.io/jq/).

**_Note: Use Node v22.x.x or newer_**

Here's how you can get started with local customization:

1. **Clone the repo:** Clone the FreshJuice theme repository to your local machine. \
   You can clone the repository using the following command:
   ```bash
   git clone {{ hsTheme.gitRepo }}
   cd freshjuice-hubspot-theme
   ```
2. **Install dependencies:** Run `npm install` to install the required dependencies.
   This will install the necessary tools and libraries for local development.
3. Run `npm run prepare` to prepare the theme for upload.
   This will install [husky](https://typicode.github.io/husky/) hooks.
4. Run `hs init` to initialize the project. \
   Follow the instructions to authenticate your HubSpot account. \
   This action will create a `hubspot.config.yaml` file in the root of your project.
5. (optional) If you do not have FreshJuice on your HubSpot account yet, run `npm run upload:hubspot` to upload the theme to your HubSpot account.
6. **Start local development:** Run `npm run start` to start the local development server.
   This will watch for changes in your source files and automatically compile and upload them to your HubSpot account.
7. **Customize the theme:**
   - Make changes to the theme files in the `~/source` directory.
     You can edit [CSS](/developer-edition/docs/tailwindcss/), [JavaScript](/developer-edition/docs/alpinejs/).
   - Make changes to the HubL templates, modules, and sections in the `~/theme` directory.

By customizing FreshJuice locally, you have more control over the development process and can get more Juice to your brand-new HubSpot theme.

### Node commands are available:

- `npm run clean`: Clean temporary directories.
- `npm run fetch:hubspot`: Fetch theme files from HubSpot.
- `npm run upload:hubspot`: Upload theme files to HubSpot.
- `npm run watch:hubspot`: Watch theme files changes and upload to HubSpot.
- `npm run watch:tailwind`: Watch Tailwind CSS changes.
- `npm run build:tailwind`: Build Tailwind CSS.
- `npm run watch:js`: Watch JS changes.
- `npm run build:js`: Build JS.
- `npm run build:zip`: Build theme and create ZIP file.
- `npm run version:patch`: Bump version patch.
- `npm run version:minor`: Bump version minor.
- `npm run version:major`: Bump version major.
- `npm run start`: Start local development. Watch Tailwind CSS, JS, and upload to HubSpot.
- `npm run build`: Build theme. Build Tailwind CSS, JS.
- `npm run prepare`: Prepare theme for upload. Install husky hooks.
