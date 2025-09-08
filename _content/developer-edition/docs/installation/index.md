---
title: Installation
desc: Learn how to install FreshJuice on your HubSpot website.
---

There is a two way how you can install FreshJuice on your HubSpot website.

---

## Installation via uploading ZIP file

1. Download the latest release `{{ hsTheme.version }}` [here]({{ hsTheme.download }}) or directly from [GitHub]({{ hsTheme.releases }}).
2. Go to your HubSpot account.
3. Navigate to `Settings` > `Tools` > `Content` > `Themes`.
4. Click on `Upload Theme` button.
5. Select the ZIP file you downloaded in step 1.
6. Click on `Upload` button.
7. Once uploaded, click on `Apply Theme` button.
8. Congratulations! You have successfully installed FreshJuice on your HubSpot account.

---

## Installation via HubSpot CLI

Installation process requires you to have `Node.JS`, `git`, `HubSpot CLI`, and `jq` installed on your machine.

- If you don't have `Node.JS` installed, you can download it from [here](https://nodejs.org/).
- If you don't have `git` installed, you can download it from [here](https://git-scm.com/).
- If you don't have [HubSpot CLI](https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli) installed, you can install it by running `npm install -g @hubspot/cli` to install the HubSpot CLI globally.
- If you don't have `jq` installed, you can download it from [here](https://stedolan.github.io/jq/).

**_Note: Use Node v22.x.x or newer_**

1. Clone the repo and CD into it.
   ```bash
   git clone {{ hsTheme.gitRepo }}
   cd freshjuice-dev-hubspot-theme
   ```
2. Run `npm install` to install the dependencies.
3. Run `npm run prepare` to prepare the theme for upload.
4. Run `hs init` to initialize the project. \
   Follow the instructions to authenticate your HubSpot account. \
   This action will create a `hubspot.config.yaml` file in the root of your project.
5. Run `npm run upload:hubspot` to upload the theme to your HubSpot account.
6. Once uploaded, navigate to `Settings` > `Tools` > `Content` > `Themes` in your HubSpot account and click on `Apply Theme` button.
7. Congratulations! You have successfully installed FreshJuice on your HubSpot account.

---

## Make it your own

Now that you have installed FreshJuice on your HubSpot account, you can customize it to make it your own. You can customize the theme by modifying the CSS, JS, and HubL files.

More information on how to customize the theme can be found in the [Customization](/developer-edition/docs/customization/) documentation.
