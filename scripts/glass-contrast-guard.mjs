/**
 * GoreeCloud UI alpha QA: conservative WCAG text-contrast bound for a single
 * foreground over a uniform RGBA glass fill and any opaque RGB backdrop.
 *
 * This checks a mathematical color-compositing model, not screenshots, local
 * image texture, shadows, contrast loss caused by nested layers, font raster
 * effects or actual screen-reader/device acceptance. No runtime dependencies.
 */
function readColor(input) {
  if (typeof input !== "string") throw new TypeError("CSS color must be a string");
  const match = /^(rgba?)\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?))?\s*\)$/i.exec(input.trim());
  if (!match) throw new TypeError("Expected a computed rgb() or rgba() CSS color");
  const channels = match.slice(2, 5).map(Number);
  if (channels.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {
    throw new RangeError("RGB channels must be integers from 0 to 255");
  }
  if ((match[1].toLowerCase() === "rgb" && match[5] !== undefined) ||
      (match[1].toLowerCase() === "rgba" && match[5] === undefined)) {
    throw new TypeError("RGBA alpha must use rgba(), not rgb()");
  }
  const alpha = match[5] === undefined ? 1 : Number(match[5]);
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError("Alpha must be between zero and one");
  }
  return { channels, alpha };
}

function luminance(channels) {
  const linear = channels.map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function ratio(a, b) {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Since sRGB channel compositing and luminance are monotonic, all possible
 * opaque RGB backdrops are bounded by pure black and white. If the foreground
 * luminance lies between the two composite bounds, a matching-luminance
 * backdrop exists and the conservative minimum is 1:1.
 *
 * Only opaque text is supported. Throw, rather than falsely pass, on
 * transparent/unsupported foreground, background, or color-function inputs.
 */
export function worstCaseTextContrast(foregroundCss, glassCss) {
  const foreground = readColor(foregroundCss);
  const glass = readColor(glassCss);
  if (foreground.alpha !== 1) {
    throw new TypeError("Transparent foreground requires a separate full compositing audit");
  }
  const againstBlack = glass.channels.map(channel => channel * glass.alpha);
  const againstWhite = glass.channels.map(channel => channel * glass.alpha + 255 * (1 - glass.alpha));
  const foregroundLuminance = luminance(foreground.channels);
  const blackLuminance = luminance(againstBlack);
  const whiteLuminance = luminance(againstWhite);
  if (foregroundLuminance < blackLuminance) {
    return Object.freeze({ ratio: ratio(foregroundLuminance, blackLuminance), limitingBackdrop: "black" });
  }
  if (foregroundLuminance > whiteLuminance) {
    return Object.freeze({ ratio: ratio(foregroundLuminance, whiteLuminance), limitingBackdrop: "white" });
  }
  return Object.freeze({ ratio: 1, limitingBackdrop: "matchable" });
}

export function assertGlassTextContrast(foregroundCss, glassCss, minimum = 4.5) {
  if (!Number.isFinite(minimum) || minimum < 1 || minimum > 21) {
    throw new RangeError("WCAG contrast minimum must be between 1 and 21");
  }
  const result = worstCaseTextContrast(foregroundCss, glassCss);
  if (result.ratio + 1e-9 < minimum) {
    throw new Error("Glass text contrast " + result.ratio.toFixed(2) + ":1 below " +
      minimum + ":1 (limiting backdrop: " + result.limitingBackdrop + ")");
  }
  return result;
}
