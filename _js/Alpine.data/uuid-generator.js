/* global Alpine */
import debugLog from "../modules/_debugLog";

// Utilities
function hex(bytes) {
  const hexes = [];
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, "0");
    hexes.push(h);
  }
  return hexes.join("");
}

function stringifyUuidBytes(b) {
  // b: Uint8Array length 16
  const s = hex(b);
  return (
    s.slice(0, 8) +
    "-" +
    s.slice(8, 12) +
    "-" +
    s.slice(12, 16) +
    "-" +
    s.slice(16, 20) +
    "-" +
    s.slice(20)
  );
}

function cryptoRandomBytes(len) {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return a;
}

// UUID v4 (RFC 4122)
function uuidv4() {
  const b = cryptoRandomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant RFC 4122
  return stringifyUuidBytes(b);
}

// UUID v7 (RFC 9562)
function uuidv7() {
  const b = cryptoRandomBytes(16);
  const ms = BigInt(Date.now()); // 48-bit Unix epoch milliseconds
  b[0] = Number((ms >> 40n) & 0xffn);
  b[1] = Number((ms >> 32n) & 0xffn);
  b[2] = Number((ms >> 24n) & 0xffn);
  b[3] = Number((ms >> 16n) & 0xffn);
  b[4] = Number((ms >> 8n) & 0xffn);
  b[5] = Number(ms & 0xffn);
  // Random already present in other bytes
  b[6] = (b[6] & 0x0f) | 0x70; // version 7
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  return stringifyUuidBytes(b);
}

// UUID v1 (RFC 4122) — time-based
// This implementation generates a standards-compliant layout
// with a random multicast node id and a session-scoped clock sequence.
const UUID_EPOCH_DIFF = 0x01b21dd213814000n; // 100ns between 1582-10-15 and 1970-01-01
let lastV1Timestamp = 0n;
let v1ClockSeq = null; // 14-bit
let v1Node = null; // 48-bit (multicast)

function initV1State() {
  if (v1ClockSeq === null) {
    // 14-bit random clock sequence
    const r = cryptoRandomBytes(2);
    v1ClockSeq = ((r[0] << 8) | r[1]) & 0x3fff;
  }
  if (v1Node === null) {
    const n = cryptoRandomBytes(6);
    // Set multicast bit per RFC 4122 (least significant bit of the first octet)
    n[0] = n[0] | 0x01;
    v1Node = n;
  }
}

function nowEpoch100ns() {
  // Combine Date.now() and performance.now() for sub-millisecond resolution when available
  const ms = BigInt(Date.now());
  let subMs = 0n;
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    const frac = Math.floor((performance.now() % 1) * 10000); // 0..9999
    subMs = BigInt(frac);
  }
  return ms * 10000n + subMs + UUID_EPOCH_DIFF;
}

function uuidv1() {
  initV1State();
  let ts = nowEpoch100ns();
  // Ensure monotonicity within this session
  if (ts <= lastV1Timestamp) {
    ts = lastV1Timestamp + 1n;
    v1ClockSeq = (v1ClockSeq + 1) & 0x3fff; // increment clock sequence on same/retro time
  }
  lastV1Timestamp = ts;

  // Break timestamp into fields
  const timeLow = Number(ts & 0xffffffffn);
  const timeMid = Number((ts >> 32n) & 0xffffn);
  const timeHi = Number((ts >> 48n) & 0x0fffn); // top 12 bits of timestamp

  const b = new Uint8Array(16);
  // time_low (32 bits)
  b[0] = (timeLow >>> 24) & 0xff;
  b[1] = (timeLow >>> 16) & 0xff;
  b[2] = (timeLow >>> 8) & 0xff;
  b[3] = timeLow & 0xff;
  // time_mid (16 bits)
  b[4] = (timeMid >>> 8) & 0xff;
  b[5] = timeMid & 0xff;
  // time_hi_and_version (4 bits version + 12 bits timestamp high)
  const timeHiAndVersion = (0x1 << 12) | timeHi; // version 1
  b[6] = (timeHiAndVersion >>> 8) & 0xff;
  b[7] = timeHiAndVersion & 0xff;
  // clock_seq (variant + 14-bit sequence)
  const seq = v1ClockSeq & 0x3fff;
  b[8] = ((seq >>> 8) & 0x3f) | 0x80; // variant 10xx xxxx
  b[9] = seq & 0xff;
  // node (48 bits)
  b.set(v1Node, 10);

  return stringifyUuidBytes(b);
}

function uuidNil() {
  return "00000000-0000-0000-0000-000000000000";
}

// Validation helper (simple shape check)
function isUuidLike(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str,
  );
}

// Alpine component
document.addEventListener("alpine:init", () => {
  Alpine.data("UuidGenerator", () => ({
    version: "4",
    result: "",
    copySuccess: false,

    generate(kind) {
      debugLog(`Generating single ${kind} UUID`);
      let v = "";
      switch (kind) {
        case "v1":
          this.version = "1";
          v = uuidv1();
          break;
        case "v7":
          this.version = "7";
          v = uuidv7();
          break;
        case "nil":
          this.version = "Nil/Empty";
          v = uuidNil();
          break;
        case "random":
        case "v4":
        default:
          this.version = "4";
          v = uuidv4();
      }
      this.result = v;
    },

    copy() {
      if (!this.result) return;
      navigator.clipboard.writeText(this.result).then(() => {
        this.copySuccess = true;
        setTimeout(() => (this.copySuccess = false), 2000);
      });
    },

    init() {
      debugLog("UUID Generator initialized");
      this.generate("random");
    },
  }));
});
