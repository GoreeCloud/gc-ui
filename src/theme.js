/**
 * Preset Iris is an alpha technical fallback, NOT a mandatory GoreeCloud brand hue.
 * Consumers may choose per-app presets or authorized custom colors independently.
 */
/** Browser/SSR safe GoreeCloud UI theme utilities. No telemetry or persistence. */
export const ACCENTS = Object.freeze(["iris", "lagoon", "ember", "moss"]);
export const MODES = Object.freeze(["light", "dark", "auto"]);

const LIGHT = Object.freeze({
  iris: "#5146C8", lagoon: "#00697A", ember: "#A43F1D", moss: "#326B42"
});
const DARK = Object.freeze({
  iris: "#BFB8FF", lagoon: "#8BE7F1", ember: "#FFB79F", moss: "#A9E0B3"
});

function rgb(hex) {
  if (typeof hex !== "string" || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new TypeError("Expected an opaque six-digit hexadecimal color");
  }
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
}
function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(a, b) {
  const aL = luminance(a);
  const bL = luminance(b);
  return (Math.max(aL, bL) + 0.05) / (Math.min(aL, bL) + 0.05);
}
function hex(values) {
  return "#" + values.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
}
function blend(a, b, portion) {
  const x = rgb(a);
  const y = rgb(b);
  return hex(x.map((v, i) => v * (1 - portion) + y[i] * portion));
}
/** Returns a legible local-only accent; not a Material Color Utilities implementation. */
export function deriveAccent(input, mode = "light") {
  if (!["light", "dark"].includes(mode)) throw new RangeError("Mode must be light or dark");
  rgb(input);
  const background = mode === "dark" ? "#0D121D" : "#FFFFFF";
  let brand = input.toUpperCase();
  const endpoint = mode === "dark" ? "#FFFFFF" : "#000000";
  for (let i = 0; i < 21 && contrastRatio(brand, background) < 4.5; i++) {
    brand = blend(brand, endpoint, 0.1);
  }
  const onBrand = contrastRatio(brand, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#0D121D";
  const container = blend(brand, mode === "dark" ? "#171D2A" : "#FFFFFF", mode === "dark" ? 0.72 : 0.84);
  const onContainer = mode === "dark" ? "#F2F4FB" : "#1B2030";
  return Object.freeze({ brand, onBrand, brandContainer: container, onBrandContainer: onContainer });
}
export function getAccentColor(name, mode = "light") {
  if (!ACCENTS.includes(name)) throw new RangeError("Unknown GoreeCloud accent");
  if (!["light", "dark"].includes(mode)) throw new RangeError("Invalid resolved mode");
  return (mode === "dark" ? DARK : LIGHT)[name];
}
/**
 * Sets theme attributes on a supplied root. Opt-in persistence belongs to consumers.
 * In auto mode CSS resolves prefers-color-scheme without JS event listeners.
 */
export function applyTheme(root, { mode = "auto", accent = "iris", contrast = "normal", customAccent } = {}) {
  if (!root || typeof root.setAttribute !== "function" || !root.style) {
    throw new TypeError("Supply a DOM root element");
  }
  if (!MODES.includes(mode)) throw new RangeError("Unknown theme mode");
  if (!ACCENTS.includes(accent)) throw new RangeError("Unknown accent family");
  if (!["normal", "more"].includes(contrast)) throw new RangeError("Unknown contrast mode");
  // Validate all user-supplied values before mutating the root.
  const dark = mode === "dark" || (mode === "auto" && typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);
  const colors = customAccent === undefined || customAccent === null ? null : deriveAccent(customAccent, dark ? "dark" : "light");
  root.setAttribute("data-gc-theme", mode);
  root.setAttribute("data-gc-accent", accent);
  root.setAttribute("data-gc-contrast", contrast);
  const names = ["--gc-brand", "--gc-on-brand", "--gc-brand-container", "--gc-on-brand-container"];
  for (const key of names) root.style.removeProperty(key);
  if (colors) {
    root.style.setProperty("--gc-brand", colors.brand);
    root.style.setProperty("--gc-on-brand", colors.onBrand);
    root.style.setProperty("--gc-brand-container", colors.brandContainer);
    root.style.setProperty("--gc-on-brand-container", colors.onBrandContainer);
  }
  return { mode, accent, contrast };
}


/**
 * Opt-in controller with live OS appearance updates for custom accents.
 * CSS-only curated themes already respond automatically to system changes.
 * No storage, telemetry, or background polling; dispose on unmount.
 */
export function createThemeController(root, options = {}) {
  let state = { mode: "auto", accent: "iris", contrast: "normal", ...options };
  let disposed = false;
  const media = typeof globalThis.matchMedia === "function"
    ? globalThis.matchMedia("(prefers-color-scheme: dark)") : null;
  const onSystemChange = () => {
    if (!disposed && state.mode === "auto" && state.customAccent != null) {
      applyTheme(root, state);
    }
  };
  const update = (next = {}) => {
    if (disposed) throw new Error("Theme controller has been disposed");
    if (!next || typeof next !== "object") throw new TypeError("Theme update must be an object");
    const candidate = { ...state, ...next };
    const value = applyTheme(root, candidate);
    state = candidate;
    return value;
  };
  update();
  media?.addEventListener?.("change", onSystemChange);
  if (!media?.addEventListener) media?.addListener?.(onSystemChange);
  return Object.freeze({
    update,
    dispose() {
      if (disposed) return;
      disposed = true;
      media?.removeEventListener?.("change", onSystemChange);
      if (!media?.removeEventListener) media?.removeListener?.(onSystemChange);
    }
  });
}
