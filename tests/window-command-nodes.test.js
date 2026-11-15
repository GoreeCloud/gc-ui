import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const authority = JSON.parse(read("registry/design-authority.v1.json"));

test("WCN registry preserves the founder-approved names, order and native actions", () => {
  const wcn = authority.windowCommandNodes;
  assert.equal(wcn.officialName, "GoreeCloud UI Window Command Nodes");
  assert.equal(wcn.abbreviation, "WCN");
  assert.equal(wcn.shortName, "Command Nodes");
  assert.equal(wcn.approvedOn, "2026-11-14");
  assert.deepEqual(wcn.controls, [
    { name: "Crimson Node", action: "Dismiss", windowOperation: "close" },
    { name: "Amber Node", action: "Dock", windowOperation: "minimize-to-workspace-dock" },
    { name: "Teal Node", action: "Expand", windowOperation: "maximize-or-restore" }
  ]);
  assert.equal(wcn.titlebarAlignment, "physical-right");
  assert.equal(wcn.visualTreatment, "flat");
  assert.equal(wcn.visibleGlyphs, false);
  assert.equal(wcn.actionSymbols, false);
  assert.equal(wcn.appAccentIndependent, true);
});

test("WCN contract does not invent unapproved geometry, colors or a native implementation", () => {
  const wcn = authority.windowCommandNodes;
  assert.equal(wcn.colorHexValues, "not-specified-by-founder");
  assert.equal(wcn.shapeGeometry, "not-specified-by-founder");
  assert.equal(wcn.status, "founder-approved-design-requirement-not-yet-implemented");
  assert.equal(wcn.adoptionStatus, "unverified");
  assert.equal(wcn.nativeWindowActionsRequired, true);
  assert.equal(wcn.accessibleNamesRequired, true);
  assert.equal(authority.nativeSdkStatus, "not-implemented");
});

test("WCN's written design contract stays discoverable and consistent with the registry", () => {
  const wcn = authority.windowCommandNodes;
  const docs = read(wcn.docs);
  const designLanguage = read("docs/DESIGN_LANGUAGE.md");
  assert.match(docs, /## Window Command Nodes \(WCN\)/);
  assert.match(docs, /\*\*Crimson Node — Dismiss\*\*/);
  assert.match(docs, /\*\*Amber Node — Dock\*\*/);
  assert.match(docs, /\*\*Teal Node — Expand\*\*/);
  assert.match(docs, /node faces are \*\*flat and contain no glyphs/);
  assert.match(docs, /\*\*right-aligned\*\*/);
  assert.match(docs, /unsaved-work/);
  assert.match(docs, /platform-dependent/);
  assert.match(designLanguage, /## Signature Window Command Nodes \(WCN\)/);
  assert.match(designLanguage, /\*\*glyph-free\*\*/);
});
