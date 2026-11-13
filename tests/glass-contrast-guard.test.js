import test from "node:test";
import assert from "node:assert/strict";
import { assertGlassTextContrast, worstCaseTextContrast } from "../scripts/glass-contrast-guard.mjs";

test("light atmospheric text remains legible over all opaque RGB backdrops", () => {
  const result = assertGlassTextContrast("rgb(27, 32, 48)", "rgba(255, 255, 255, 0.84)");
  assert.equal(result.limitingBackdrop, "black");
  assert.ok(result.ratio > 4.5);
});

test("dark atmospheric text remains legible over all opaque RGB backdrops", () => {
  const result = assertGlassTextContrast("rgb(242, 244, 251)", "rgba(30, 38, 53, 0.86)");
  assert.equal(result.limitingBackdrop, "white");
  assert.ok(result.ratio > 4.5);
});

test("opaque black-on-white achieves the standard maximum ratio", () => {
  const result = worstCaseTextContrast("rgb(0, 0, 0)", "rgb(255, 255, 255)");
  assert.ok(Math.abs(result.ratio - 21) < 1e-9);
});

test("transparent glass or foreground close to the composited surface fails closed", () => {
  assert.deepEqual(worstCaseTextContrast("rgb(128, 128, 128)", "rgba(0, 0, 0, 0)"),
    { ratio: 1, limitingBackdrop: "matchable" });
  assert.throws(() => assertGlassTextContrast("rgb(128, 128, 128)", "rgba(0, 0, 0, 0)"), /below 4.5:1/);
  assert.throws(() => assertGlassTextContrast("rgb(128, 128, 128)", "rgb(128, 128, 128)"), /below 4.5:1/);
});

test("opaque CSS foregrounds and supported numeric formats only", () => {
  for (const input of [
    "transparent", "#fff", "rgb(300, 0, 0)", "rgb(255, 0, 0, 0.5)",
    "rgba(255, 0, 0)", "rgba(0, 0, 0, 1.2)", "rgb(calc(255 / 2), 0, 0)"
  ]) {
    assert.throws(() => worstCaseTextContrast(input, "rgb(255, 255, 255)"), /CSS|RGB|RGBA|opaque|computed|alpha|Alpha|foreground/);
  }
  assert.throws(() => worstCaseTextContrast("rgba(0, 0, 0, 0.5)", "rgb(255, 255, 255)"),
    /Transparent foreground/);
  assert.throws(() => worstCaseTextContrast("rgb(0, 0, 0)", "color(display-p3 1 1 1)"),
    /computed rgb/);
});

test("contrast thresholds are explicit and bounded", () => {
  assert.throws(() => assertGlassTextContrast("rgb(0, 0, 0)", "rgb(255, 255, 255)", 22), RangeError);
  assert.throws(() => assertGlassTextContrast("rgb(0, 0, 0)", "rgb(255, 255, 255)", NaN), RangeError);
  assert.ok(assertGlassTextContrast("rgb(0, 0, 0)", "rgb(255, 255, 255)", 21).ratio >= 21);
});
