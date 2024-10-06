/* global Alpine */
import debugLog from "../modules/_debugLog";

document.addEventListener("alpine:init", () => {
  Alpine.data("MetadataChecker", () => ({
    targetUrl: '',
    status: "idle", // idle, loading, success, error
    showResults: false,
    loading: false,
    buttonLabel: "Check Website Metadata",
    previewData: {},
    results: {},
    labelDescriptions: [
      // do not comment
      { label: "title", description: "The title of the page" },
      { label: "description", description: "The description of the page" },
      { label: "og:title", description: "The title of the page" },
      { label: "og:type", description: "The type of the page" },
      { label: "og:url", description: "The URL of the page" },
      { label: "og:image", description: "The image of the page" },
      { label: "og:image:alt", description: "The alt text of the image" },
      { label: "og:description", description: "The description of the page" },
      { label: "og:site_name", description: "The name of the site" },
      { label: "twitter:card", description: "The type of twitter card" },
      { label: "twitter:site", description: "The twitter account site" },
      { label: "twitter:creator", description: "The twitter account username" },
      { label: "twitter:title", description: "The title of the twitter post" },
      { label: "twitter:description", description: "The description of the twitter post" },
      { label: "twitter:image", description: "The image of the twitter post" },
      { label: "twitter:image:alt", description: "The alt text of the twitter post image" },
      { label: "og:image:secure_url", description: "A secure (HTTPS) URL of the image." },
      { label: "og:image:type", description: "The MIME type of the image (e.g., image/jpeg)." },
      { label: "og:image:width", description: "The width of the image in pixels." },
      { label: "og:image:height", description: "The height of the image in pixels." },
      { label: "og:audio", description: "The URL of an audio file to accompany your content." },
      { label: "og:audio:secure_url", description: "A secure (HTTPS) URL of the audio file." },
      { label: "og:audio:type", description: "The MIME type of the audio file (e.g., audio/mpeg)." },
      { label: "og:determiner", description: "The word to precede the title, like 'a' or 'the'." },
      { label: "og:locale", description: "The locale of the content (e.g., en_US)." },
      { label: "og:locale:alternate", description: "Alternate locales for the content." },
      { label: "og:video", description: "The URL of a video to accompany your content." },
      { label: "og:video:secure_url", description: "A secure (HTTPS) URL of the video." },
      { label: "og:video:type", description: "The MIME type of the video (e.g., video/mp4)." },
      { label: "og:video:width", description: "The width of the video in pixels." },
      { label: "og:video:height", description: "The height of the video in pixels." },
      { label: "og:video:duration", description: "The length of the video in seconds." },
      { label: "og:updated_time", description: "The last time the content was updated." },
      { label: "og:article:published_time", description: "The time the article was first published." },
      { label: "og:article:modified_time", description: "The time the article was last modified." },
      { label: "og:article:expiration_time", description: "The time after which the article is no longer relevant." },
      { label: "og:article:author", description: "The author of the article." },
      { label: "og:article:section", description: "A high-level section name for the article (e.g., Technology)." },
      { label: "og:article:tag", description: "Keywords associated with the article." },
      { label: "og:article:publisher", description: "The publisher of the article." },
      { label: "og:book:author", description: "The author of the book." },
      { label: "og:book:isbn", description: "The ISBN number of the book." },
      { label: "og:book:release_date", description: "The release date of the book." },
      { label: "og:book:tag", description: "Tags associated with the book." },
      { label: "og:profile:first_name", description: "The first name of the person in the profile." },
      { label: "og:profile:last_name", description: "The last name of the person in the profile." },
      { label: "og:profile:username", description: "The username of the person in the profile." },
      { label: "og:profile:gender", description: "The gender of the person in the profile (male or female)." },
      { label: "og:music:song", description: "The specific song from the album." },
      { label: "og:music:song:disc", description: "The disc number for the song." },
      { label: "og:music:song:track", description: "The track number for the song." },
      { label: "og:music:album", description: "The album the music belongs to." },
      { label: "og:music:album:disc", description: "The disc number in the album." },
      { label: "og:music:album:track", description: "The track number on the disc." },
      { label: "og:music:musician", description: "The musician who performed the music." },
      { label: "og:music:release_date", description: "The release date of the music." },
      { label: "og:music:radio_station", description: "The radio station playing the music." },
      { label: "og:video:actor", description: "An actor featured in the video." },
      { label: "og:video:actor:role", description: "The role of the actor in the video." },
      { label: "og:video:director", description: "The director of the video." },
      { label: "og:video:writer", description: "The writer of the video." },
      { label: "og:video:series", description: "The series to which the video belongs." },
      { label: "twitter:site:id", description: "The numeric Twitter ID of the website or the account related to the content." },
      { label: "twitter:creator:id", description: "The numeric Twitter ID of the content creator." },
      { label: "twitter:player", description: "The URL to the player iframe for video/audio content." },
      { label: "twitter:player:width", description: "The width of the player in pixels." },
      { label: "twitter:player:height", description: "The height of the player in pixels." },
      { label: "twitter:player:stream", description: "The URL to the video or audio stream." },
      { label: "twitter:app:name:iphone", description: "The name of your app in the iTunes App Store (iPhone version)." },
      { label: "twitter:app:id:iphone", description: "Your app's iTunes ID (iPhone version)." },
      { label: "twitter:app:url:iphone", description: "The URL for opening your app on iPhone." },
      { label: "twitter:app:name:ipad", description: "The name of your app in the iTunes App Store (iPad version)." },
      { label: "twitter:app:id:ipad", description: "Your app's iTunes ID (iPad version)." },
      { label: "twitter:app:url:ipad", description: "The URL for opening your app on iPad." },
      { label: "twitter:app:name:googleplay", description: "The name of your app in the Google Play Store." },
      { label: "twitter:app:id:googleplay", description: "Your app's Google Play Store ID." },
      { label: "twitter:app:url:googleplay", description: "The URL for opening your app on Android." },
    ],
    setButtonLabel() {
      switch (this.status) {
        case "loading":
          this.buttonLabel = "Checking...";
          break;
        case "success":
          this.buttonLabel = "Check Again";
          break;
        case "error":
          this.buttonLabel = "Try Again with a Different URL";
          break;
        default:
          this.buttonLabel = "Check Website Metadata";
      }
    },
    initProcessing() {
      this.initLoading();
      this.fetchPageData();
    },
    initLoading() {
      this.status = "loading";
      this.setButtonLabel();
      this.showResults = false;
      this.loading = true;
    },
    stopLoading() {
      this.status = "idle";
      this.setButtonLabel();
      this.loading = false;
    },
    initSuccess() {
      debugLog("S for Success");
      this.status = "success";
      this.setButtonLabel();
      this.showResults = true;
      this.loading = false;
    },
    initError(error) {
      this.status = "error";
      this.setButtonLabel();
      this.showResults = false;
      this.loading = false;
      console.error(error);
    },
    isValidUrl(url) {
      const urlRegex = /^(http|https):\/\/[^ "]+$/;
      return urlRegex.test(url);
    },
    modifyData(data) {
      // Social Previews Data Object
      this.previewData = data;

      for (let obj in this.previewData) {
        let newObj = { ...this.previewData[obj] };

        for (let key in newObj) {
          if (key.includes('og:') || key.includes('twitter:')) {
            let newKey = key.replace(/og:|twitter:|:/g, '');
            newObj[newKey] = newObj[key];
            delete newObj[key];
          }
        }

        this.previewData[obj] = newObj;
      }

      // console.log(this.previewData);
    },
    async fetchPageData() {
      if (!this.isValidUrl(this.targetUrl)) {
        this.initError("Invalid URL provided");
        return;
      }
      await fetch("/api/metadata-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUrl: this.targetUrl }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          this.modifyData(data);
          debugLog('Response Data:', data);
          debugLog('Modified Data:', this.previewData);
          this.initSuccess();
        })
        .catch((error) => {
          this.initError(error);
        });
    }
  }));
});
