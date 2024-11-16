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
    tableData: {},
    labelDescriptions: {
      "title": "The title of the page",
      "description": "The description of the page",
      "og:title": "The title of the page",
      "og:type": "The type of the page",
      "og:url": "The URL of the page",
      "og:image": "The image of the page",
      "og:image:alt": "The alt text of the image",
      "og:description": "The description of the page",
      "og:site_name": "The name of the site",
      "twitter:card": "The type of twitter card",
      "twitter:site": "The twitter account site",
      "twitter:creator": "The twitter account username",
      "twitter:title": "The title of the twitter post",
      "twitter:description": "The description of the twitter post",
      "twitter:image": "The image of the twitter post",
      "twitter:image:alt": "The alt text of the twitter post image",
      "og:image:secure_url": "A secure (HTTPS) URL of the image.",
      "og:image:type": "The MIME type of the image (e.g., image/jpeg).",
      "og:image:width": "The width of the image in pixels.",
      "og:image:height": "The height of the image in pixels.",
      "og:audio": "The URL of an audio file to accompany your content.",
      "og:audio:secure_url": "A secure (HTTPS) URL of the audio file.",
      "og:audio:type": "The MIME type of the audio file (e.g., audio/mpeg).",
      "og:determiner": "The word to precede the title, like 'a' or 'the'.",
      "og:locale": "The locale of the content (e.g., en_US).",
      "og:locale:alternate": "Alternate locales for the content.",
      "og:video": "The URL of a video to accompany your content.",
      "og:video:secure_url": "A secure (HTTPS) URL of the video.",
      "og:video:type": "The MIME type of the video (e.g., video/mp4).",
      "og:video:width": "The width of the video in pixels.",
      "og:video:height": "The height of the video in pixels.",
      "og:video:duration": "The length of the video in seconds.",
      "og:updated_time": "The last time the content was updated.",
      "og:article:published_time": "The time the article was first published.",
      "og:article:modified_time": "The time the article was last modified.",
      "og:article:expiration_time": "The time after which the article is no longer relevant.",
      "og:article:author": "The author of the article.",
      "og:article:section": "A high-level section name for the article (e.g., Technology).",
      "og:article:tag": "Keywords associated with the article.",
      "og:article:publisher": "The publisher of the article.",
      "og:book:author": "The author of the book.",
      "og:book:isbn": "The ISBN number of the book.",
      "og:book:release_date": "The release date of the book.",
      "og:book:tag": "Tags associated with the book.",
      "og:profile:first_name": "The first name of the person in the profile.",
      "og:profile:last_name": "The last name of the person in the profile.",
      "og:profile:username": "The username of the person in the profile.",
      "og:profile:gender": "The gender of the person in the profile (male or female).",
      "og:music:song": "The specific song from the album.",
      "og:music:song:disc": "The disc number for the song.",
      "og:music:song:track": "The track number for the song.",
      "og:music:album": "The album the music belongs to.",
      "og:music:album:disc": "The disc number in the album.",
      "og:music:album:track": "The track number on the disc.",
      "og:music:musician": "The musician who performed the music.",
      "og:music:release_date": "The release date of the music.",
      "og:music:radio_station": "The radio station playing the music.",
      "og:video:actor": "An actor featured in the video.",
      "og:video:actor:role": "The role of the actor in the video.",
      "og:video:director": "The director of the video.",
      "og:video:writer": "The writer of the video.",
      "og:video:series": "The series to which the video belongs.",
      "twitter:site:id": "The numeric Twitter ID of the website or the account related to the content.",
      "twitter:creator:id": "The numeric Twitter ID of the content creator.",
      "twitter:player": "The URL to the player iframe for video/audio content.",
      "twitter:player:width": "The width of the player in pixels.",
      "twitter:player:height": "The height of the player in pixels.",
      "twitter:player:stream": "The URL to the video or audio stream.",
      "twitter:app:name:iphone": "The name of your app in the iTunes App Store (iPhone version).",
      "twitter:app:id:iphone": "Your app's iTunes ID (iPhone version).",
      "twitter:app:url:iphone": "The URL for opening your app on iPhone.",
      "twitter:app:name:ipad": "The name of your app in the iTunes App Store (iPad version).",
      "twitter:app:id:ipad": "Your app's iTunes ID (iPad version).",
      "twitter:app:url:ipad": "The URL for opening your app on iPad.",
      "twitter:app:name:googleplay": "The name of your app in the Google Play Store.",
      "twitter:app:id:googleplay": "Your app's Google Play Store ID.",
      "twitter:app:url:googleplay": "The URL for opening your app on Android."
    },
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
    refactorData(data) {
      /* Goes through the data object and finds all objKeys
      *  Finds all the keys in the objects in the data that have their key matching with a label in labelDescriptions
      *  Adds the key and value from labelDescriptions into tableData for later usage
      * */
      for (let objKey of Object.keys(data)) {
        for (let key of Object.keys(data[objKey])) {
          for (let label of Object.keys(this.labelDescriptions)) {
            if (key === label) {
              this.tableData[key] = this.labelDescriptions[key];
            }
          }

          this.previewData[key] = data[objKey][key];
        }
      }

      // TODO: Possible filtering of previewData to include only the keys used
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
          this.refactorData(data);
          // this.modifyData(data);
          debugLog('Response Data:', data);
          // debugLog('Table Data:', this.tableData);
          // debugLog('Preview Data:', this.previewData);
          this.initSuccess();
        })
        .catch((error) => {
          this.initError(error);
        });
    }
  }));
});
