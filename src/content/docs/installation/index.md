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

1. Install [HubSpot CLI](https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli).
2. Clone the repo and CD into it.
   ```bash
   git clone {{ hsTheme.gitRepo }}
   cd freshjuice-hubspot-theme
   ```
3. Run `npm install` (Uses Node v20.0.0 or newer).
