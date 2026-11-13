import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const load = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("generated palettes isolate explicitly configured application roots",()=>{
  const css=load("src/tokens.css"),generator=load("scripts/generate-web-tokens.mjs");
  for(const selector of [
    ":root, .gc-app[data-gc-theme] {",
    '.gc-app[data-gc-theme="dark"]',
    '.gc-app[data-gc-theme="auto"]',
    '.gc-app[data-gc-theme][data-gc-accent="lagoon"]',
    '.gc-app[data-gc-theme="dark"][data-gc-accent="ember"]',
    '.gc-app[data-gc-theme="auto"][data-gc-accent="moss"]',
    '.gc-app[data-gc-theme][data-gc-contrast="more"]',
    '.gc-app[data-gc-theme]:not([data-gc-contrast="normal"])'
  ]) assert.ok(css.includes(selector),selector);
  assert.ok(generator.includes(".gc-app[data-gc-theme]"),"Generator must retain app scoping");
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce) { :root, .gc-app[data-gc-theme] {"),"Scoped apps must honor reduced motion");
  assert.ok(!css.includes("\n.gc-app {"),"An unconfigured app must inherit the host's palette");
});

test("design authority does not require hue or appearance mode",()=>{
  const policy=JSON.parse(load("registry/design-authority.v1.json")).colorPolicy;
  assert.equal(policy.mandatoryGlobalHue,false);
  assert.equal(policy.mandatoryAppearanceTheme,false);
  assert.equal(policy.independentApplicationChoices,true);
  assert.equal(policy.independentApplicationAppearance,true);
  assert.equal(policy.webThemeScope,"document-root-or-configured-gc-app");
  assert.match(load("docs/DESIGN_LANGUAGE.md"),/No GoreeCloud color hue \*\*or light\/dark appearance mode\*\* is mandatory/);
});
