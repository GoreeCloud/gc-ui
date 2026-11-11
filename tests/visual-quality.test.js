import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("premium presentation uses shared canonical semantic roles",()=>{
  const css=load("src/components.css");
  for(const name of [".gc-premium-shell",".gc-showcase",".gc-showcase__content",".gc-showcase__visual",
    ".gc-showcase__floating",".gc-showcase__metrics",".gc-metric",".gc-overline",
    ".gc-feature-grid",".gc-feature-tile",".gc-feature-tile__icon"]) {
    assert.ok(css.includes(name),"Missing premium primitive "+name);
  }
  for(const role of ["--gc-brand","--gc-brand-container","--gc-surface","--gc-surface-tonal",
    "--gc-outline-soft","--gc-lens-solid","--gc-shadow-2","--gc-on-brand-container"]) {
    assert.ok(css.includes("var("+role+")"),"Missing semantic role "+role);
  }
  const section=css.slice(css.indexOf("/* GoreeCloud UI signature composition:"));
  assert.doesNotMatch(section,/#[0-9A-Fa-f]{6}\b/,"Do not introduce palette forks in signature CSS");
  assert.doesNotMatch(section,/https?:\/\/|@import\b/,"Premium appearance must not depend on remote assets");
});
test("premium visuals degrade gracefully in accessible modes",()=>{
  const css=load("src/components.css");
  const section=css.slice(css.indexOf("/* GoreeCloud UI signature composition:"));
  for(const media of ["prefers-reduced-motion:reduce","prefers-reduced-transparency:reduce",
    "prefers-contrast:more","forced-colors:active"])assert.ok(section.includes(media),media);
  assert.ok(section.includes(".gc-app a.gc-button { color:var(--gc-on-brand)"),"Anchor buttons need semantic foreground");
  assert.ok(section.includes("background:var(--gc-lens-solid)"),"Text must be on a solid backdrop");
  assert.ok(section.includes("inline-size:min(82%,320px)"));
  assert.ok(section.includes("grid-template-columns:minmax(0,1fr)"));
});
test("signature lab, governance and browser QA remain aligned",()=>{
  const lab=load("lab/index.html"),runner=load("tests/browser-smoke.mjs");
  for(const x of ['id="premium"','gc-showcase__title','gc-feature-tile','gc-premium-shell'])assert.ok(lab.includes(x),x);
  assert.ok(runner.includes("gc-ui-premium-dark-mobile.png"));
  assert.ok(runner.includes("gc-ui-premium-desktop.png"));
  assert.match(load("docs/VISUAL_QUALITY.md"),/mandatory|Premium/i);
  assert.match(load("docs/DESIGN_LANGUAGE.md"),/Premium visual quality is mandatory/);
});

test("machine-readable authority makes premium quality mandatory without false certification",()=>{
  const registry=JSON.parse(load("registry/design-authority.v1.json"));
  assert.equal(registry.visualQuality.requirement,"mandatory");
  assert.equal(registry.visualQuality.identity,"distinctive-premium-modern");
  assert.equal(registry.visualQuality.acceptance,"per-consumer-evidence-required");
  assert.equal(registry.visualQuality.nativeStatus,"unverified");
  assert.equal(registry.implementation.visualQualityDocs,"docs/VISUAL_QUALITY.md");
  assert.equal(registry.consumerMigrationStatus,"not-audited");
  assert.equal(registry.nativeSdkStatus,"not-implemented");
  assert.ok(load(registry.implementation.visualQualityDocs).includes("Non-negotiable identity"));
  assert.ok(load(".github/PULL_REQUEST_TEMPLATE.md").includes("not generic"));
});

test("color freedom is a founder requirement, while accessible semantic roles stay mandatory",()=>{
  const registry=JSON.parse(load("registry/design-authority.v1.json"));
  assert.equal(registry.colorPolicy.mandatoryGlobalHue,false);
  assert.equal(registry.colorPolicy.curatedPresets,"optional-illustrative");
  assert.equal(registry.colorPolicy.independentApplicationChoices,true);
  assert.ok(registry.colorPolicy.accessibility.includes("contrast"));
  assert.ok(load("docs/DESIGN_LANGUAGE.md").includes("no mandatory global/default/system/brand color"));
  assert.ok(load("lab/index.html").includes("Four optional example accent families"));
  assert.ok(!load("lab/index.html").includes("Four approved accent families"));
});

test("skip link moves by its own height, not a fixed negative offset",()=>{
  const css=load("src/components.css");
  const start=css.indexOf("/* Skip-to-content must remain outside");
  const rule=css.slice(start);
  assert.ok(start>=0);
  assert.ok(rule.includes("translateY(calc(-100% - 12px))"));
  assert.ok(rule.includes(".gc-app .gc-link-skip:focus"));
  assert.ok(rule.includes("transform:none"));
  assert.ok(rule.includes("forced-colors:active"));
  const lab=load("lab/lab.css");
  assert.ok(lab.includes(".gc-app .gc-lab-toolbar .gc-lab-select"));
  assert.ok(lab.includes(".gc-lab-hero-copy > .gc-lab-status-cluster .gc-badge"));
});

test("mobile hero keeps complete words at physical phone widths, with extreme fallback",()=>{
  const css=load("lab/lab.css");
  const heading=css.indexOf("/* Prevent the rounded hero's clipping boundary");
  const mobile=css.indexOf("/* Real-phone visual QA");
  assert.ok(heading>=0 && mobile>heading);
  const baseline=css.slice(heading,mobile);
  assert.match(baseline,/overflow-wrap:anywhere/);
  assert.match(baseline,/hyphens:auto/);
  const rule=css.slice(mobile);
  assert.match(rule,/@media \(min-width:320px\) and \(max-width:600px\)/);
  assert.match(rule,/\.gc-lab-hero h1, \.gc-lab-hero h1 > span/);
  for(const style of ["hyphens:manual","overflow-wrap:anywhere","word-break:normal","text-wrap:wrap"])
    assert.ok(rule.includes(style),style);
});
