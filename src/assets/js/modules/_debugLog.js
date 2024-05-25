module.exports = (...args) => {
  if (location.hostname.match("local") || window.sessionStorage.unicorn)
    console.log("🦄:", ...args);
};
