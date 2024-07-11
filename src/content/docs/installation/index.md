---
title: Installation
desc: Learn how to install FreshJuice on your HubSpot website.
---

There is a two way how you can install FreshJuice on your HubSpot website.

## Installation via uploading ZIP file

1. Download the latest release from [GitHub]({{ hsTheme.releases }}).
2. Go to your HubSpot account.
3. Navigate to `Settings` > `Tools` > `Content` > `Themes`.
4. Click on `Upload Theme` button.
5. Select the ZIP file you downloaded in step 1.
6. Click on `Upload` button.
7. Once uploaded, click on `Apply Theme` button.

## Installation via HubSpot CLI

Installation process requires you to have `Node.js`, `git`, `HubSpot CLI`, and `jq` installed on your machine.

- If you don't have Node installed, you can download it from [here](https://nodejs.org/).
- If you don't have git installed, you can download it from [here](https://git-scm.com/).
- If you don't have [HubSpot CLI](https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli) installed, you can install it by running `npm install -g @hubspot/cli`  to install the HubSpot CLI globally.
- If you don't have jq installed, you can download it from [here](https://stedolan.github.io/jq/).

***Note: Use Node v20.0.0 or newer***

1. Clone the repo and CD into it.
   ```bash
   git clone {{ hsTheme.gitRepo }}
   cd freshjuice-hubspot-theme
   ```
2. Run `npm install` to install the dependencies.
3. Run `hs init` to initialize the project. \
   This will create a `.hsconfig.json` file in the root of your project.
