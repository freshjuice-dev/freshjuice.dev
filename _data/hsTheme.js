async function getPackageVersion() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/freshjuice-dev/freshjuice-hubspot-theme/main/package.json");
    const data = await response.json();
    return data.version;
  } catch (error) {
    console.error('Error:', error);
    return "v1.16.0"; // Default version in case of error
  }
}

async function getLatestReleaseVersion() {
  try {
    const response = await fetch("https://api.github.com/repos/freshjuice-dev/freshjuice-hubspot-theme/releases");
    const data = await response.json();
    return data[0].tag_name;
  } catch (error) {
    console.error('Error:', error);
    return "v1.16.0"; // Default version in case of error
  }
}

export default async () => {
  const themeVersion = await getPackageVersion();
  return {
    repo: "https://github.com/freshjuice-dev/freshjuice-hubspot-theme",
    gitRepo: "git@github.com:freshjuice-dev/freshjuice-hubspot-theme.git",
    demo: "https://143910617.hs-sites-eu1.com/blog",
    version: themeVersion,
    releases: "https://github.com/freshjuice-dev/freshjuice-hubspot-theme/releases",
    download: `https://github.com/freshjuice-dev/freshjuice-hubspot-theme/releases/download/${themeVersion}/freshjuice-hubspot-theme-${themeVersion}.zip`,
  };
}
