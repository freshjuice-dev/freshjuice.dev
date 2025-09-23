export default () => {
  let ua = "";

  if (navigator.userAgentData && navigator.userAgentData.brands) {
    ua = navigator.userAgentData.brands
      .map((b) => b.brand.toLowerCase())
      .join(" ");
  } else {
    ua = navigator.userAgent.toLowerCase();
  }

  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("trident") || ua.includes("msie")) return "IE";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  return "Chrome";
};
