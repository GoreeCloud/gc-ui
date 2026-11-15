import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contrastRatio } from "../src/theme.js";

const read = path => readFileSync(new URL("../" + path, import.meta.url),"utf8");
const html=read("lab/index.html");
const studio=read("lab/studio.css");
const tokens=JSON.parse(read("tokens/gc.tokens.json"));

test("UI Studio keeps all nine existing destinations while grouping them meaningfully",()=>{
  const nav=html.match(/<nav id="gc-lab-rail-links"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav,"navigation rail exists with its original ID");
  assert.deepEqual([...nav.matchAll(/href="#([^"]+)"/g)].map(x=>x[1]),[
    "overview","identity","foundations","premium","rounded-windows",
    "components","patterns","forms","iconography"
  ]);
  assert.deepEqual([...nav.matchAll(/gc-lab-nav-group[^>]*>([^<]+)<\/p>/g)].map(x=>x[1]),
    ["DISCOVER","THE SYSTEM","REFERENCE"]);
  assert.match(html,/data-gc-rail-toggle/);
  assert.match(html,/aria-controls="gc-lab-rail-links"/);
  assert.match(studio,/\.gc-lab-rail\[data-gc-collapsed="true"\]/);
});

test("sidebar provides a real accessible section search and contextual location",()=>{
  assert.match(html,/<div class="gc-lab-rail-search gc-navigation-rail__secondary" role="search">/);
  assert.match(html,/<label class="gc-lab-search-label" for="gc-lab-rail-search">FIND A SECTION<\/label>/);
  assert.match(html,/id="gc-lab-rail-search" type="search" aria-label="Find a studio section"/);
  assert.match(html,/aria-controls="gc-lab-rail-links"/);
  assert.match(html,/id="gc-lab-search-status"[^>]*role="status" aria-live="polite" hidden/);
  assert.match(html,/id="gc-lab-current-section"/);
  assert.match(studio,/--gc-navigation-rail-expanded:272px/);
  assert.match(studio,/\.gc-lab-rail \.gc-navigation-rail__links a\[hidden\]/);
  assert.match(studio,/\.gc-lab-rail\[data-gc-collapsed="true"\] \.gc-lab-rail-search/);
  const code=read("lab/studio-navigation.js");
  assert.match(code,/export function initStudioSectionFinder/);
  assert.match(code,/event\.isComposing/);
  assert.match(code,/event\.key === "Escape"/);
  assert.match(code,/event\.key === "Enter"/);
  assert.match(code,/event\.key !== "\/"/);
  assert.doesNotMatch(code,/\.innerHTML\s*=|localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|eval\s*\(/);
  assert.match(read("lab/app.js"),/initStudioSectionFinder/);
});

test("founder-approved WCNs remain the actual interactive preview, with no fake hero buttons",()=>{
  const win=html.match(/<section id="rounded-windows"[\s\S]*?<\/section>/)?.[0];
  assert.ok(win);
  assert.match(win,/class="gc-window__command-nodes"/);
  for(const action of ["dismiss","dock","expand"])assert.match(win,new RegExp('data-gc-window-command="'+action+'"'));
  const hero=html.match(/<section id="overview"[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero);
  assert.match(hero,/Your workspace,<br><span class="gc-lab-highlight">your way\.<\/span>/);
  assert.match(hero,/role="img" aria-label="Visual sample/);
  assert.doesNotMatch(hero,/data-gc-window-command=/);
  assert.match(hero,/VISUAL STUDY \/ NO DESKTOP ACTIONS/);
  assert.match(studio,/\.gc-lab-preview-node--dismiss\s*\{\s*background:var\(--gc-wcn-crimson\)/);
});

test("hero keeps every real demo and the lab-only planned availability control",()=>{
  for(const id of ["open-dialog","open-command","notify"])assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/data-gc-feature="Mesh integrations"/);
  assert.match(html,/data-gc-availability="planned"/);
  assert.match(html,/id="appearance"/);
  assert.match(html,/id="accent"/);
  assert.match(html,/id="contrast"/);
  assert.match(html,/id="transparency"/);
  const module=read("lab/app.js");
  assert.match(module,/initNavigationRail/);
  assert.match(module,/initWindowCommandNodes/);
});

test("studio stylesheet layers after shared components without modifying core or adding remote assets",()=>{
  const links=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(x=>x[1]);
  assert.deepEqual(links.slice(-2),["./lab.css","./studio.css"]);
  assert.doesNotMatch(studio,/@import|url\(\s*["']?https?:/i);
  assert.match(studio,/\.gc-lab-rail\.gc-navigation-rail/);
  assert.match(studio,/\.gc-lab-preview-materials/);
  assert.match(studio,/@media \(max-width:600px\)/);
  assert.match(studio,/@media \(forced-colors:active\)/);
  assert.match(studio,/prefers-reduced-motion:reduce/);
  assert.match(studio,/prefers-reduced-transparency:reduce/);
});

test("new dark shell colors reuse canonical semantic values and remain readable",()=>{
  const dark=tokens.semantic.dark,light=tokens.semantic.light;
  assert.equal(dark.surface,"#171D2A");
  assert.equal(dark["surface-tonal"],"#252D3D");
  assert.equal(dark.text,"#F2F4FB");
  assert.equal(dark["text-soft"],"#CED5E5");
  assert.equal(light.surface,"#FFFFFF");
  assert.equal(light.text,"#1B2030");
  assert.ok(contrastRatio(dark.text,dark.surface)>=7,"headline contrast");
  assert.ok(contrastRatio(dark["text-soft"],dark.surface)>=4.5,"sidebar and helper contrast");
  assert.ok(contrastRatio(light.text,light.surface)>=7,"preview reading contrast");
  assert.match(studio,/--gc-studio-ink: #171D2A/);
  assert.match(studio,/--gc-studio-ink-text: #F2F4FB/);
});

test("material study avoids AI-template decoration and uses real navigable Cloud Lens actions",()=>{
  const premium=html.match(/<section id="premium"[\s\S]*?<section class="gc-frost-demo"/)?.[0];
  assert.ok(premium,"material study exists before frosted stage");
  assert.match(premium,/gc-studio-showcase/);
  assert.match(premium,/Depth where it earns its place/);
  assert.doesNotMatch(premium,/Beautiful by design|gc-showcase__orbit|gc-showcase__progress/);
  for(const [index,role] of [["01","Canvas"],["02","Surface"],["03","Lens"]])
    assert.ok(premium.includes("<dt><span>"+index+"</span> "+role+"</dt>"),"Missing material "+role);
  for(const target of ["#patterns","#forms"])assert.ok(premium.includes('href="'+target+'"'));
  assert.match(premium,/aria-label="Cloud Lens example navigation"/);
  assert.match(premium,/NO LIVE SERVICE DATA/);
  assert.match(studio,/\.gc-app #premium \.gc-studio-showcase::before \{ display:none; \}/);
  assert.match(studio,/\.gc-app #premium \.gc-studio-lens-actions a:focus-visible/);
  assert.match(studio,/:root:is\(\[data-gc-contrast="more"\],\[data-gc-transparency="reduce"\]\)/);
});


test("viewport-aware studio navigation preserves native URLs and original command nodes",()=>{
  const nav=read("lab/studio-navigation.js");
  assert.match(nav,/export function initStudioViewportNavigation/);
  assert.match(nav,/requestAnimationFrame\(sync\)/);
  assert.match(nav,/addEventListener\("scroll", schedule, \{ passive: true \}\)/);
  assert.match(nav,/Math\.min\(rect\.bottom, readingBottom\) - Math\.max\(rect\.top, readingTop\)/);
  assert.match(nav,/setAttribute\("aria-current", "page"\)/);
  assert.match(nav,/breadcrumb\.textContent = current\.label/);
  assert.doesNotMatch(nav,/history\.replaceState|history\.pushState|location\.hash\s*=/);
  assert.match(read("lab/app.js"),/initStudioViewportNavigation/);
  assert.match(html,/class="gc-window__command-nodes"/);
});

test("icon reference is searchable, grouped, responsive, and uses only canonical icon assets",()=>{
  const source=read("lab/studio-icon-library.js");
  const app=read("lab/app.js");
  const original=JSON.parse(read("assets/gc-icons.json"));
  assert.match(source,/export function initStudioIconLibrary/);
  assert.match(app,/initStudioIconLibrary\(document\.querySelector\("#gc-studio-icon-library"\), ICON_NAMES\)/);
  assert.match(html,/id="gc-studio-icon-search" type="search"|type="search" id="gc-studio-icon-search"/);
  assert.match(html,/id="gc-studio-icon-category"/);
  assert.match(html,/id="gc-studio-icon-results" role="status" aria-live="polite"/);
  assert.match(html,/id="gc-studio-icon-clear"/);
  for(const category of ["navigation","actions","workspace","protection","feedback"]){
    assert.match(source,new RegExp('id:"'+category+'"'));
    assert.match(html,new RegExp('value="'+category+'"'));
  }
  const names=[...source.matchAll(/names:\[([^\]]+)\]/g)]
    .flatMap(m=>[...m[1].matchAll(/"([^"]+)"/g)].map(v=>v[1]));
  assert.deepEqual(new Set(names),new Set(original.icons.map(item=>item.name)));
  assert.equal(names.length,original.icons.length);
  assert.match(studio,/\.gc-studio-icon-groups/);
  assert.match(studio,/\.gc-app \.gc-studio-icon-library \[hidden\] \{ display:none !important; \}/);
  assert.match(studio,/@media \(max-width:430px\)/);
  assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|localStorage|\.innerHTML\s*=/);
});


test("workflow layouts promote real tables and navigation rather than orphaned fifth cards",()=>{
  for(const section of ["components","patterns","forms"]) {
    assert.match(html,new RegExp('id="'+section+'" class="gc-lab-section"'));
  }
  assert.match(studio,/\.gc-app #components > \.gc-grid--two > article:last-child \{\s*grid-column:1 \/ -1/);
  assert.match(studio,/\.gc-app #patterns > \.gc-grid--two > article:last-child \{\s*grid-column:1 \/ -1/);
  assert.match(studio,/\.gc-app #patterns > \.gc-grid--two > article:last-child > \.gc-tree/);
  assert.match(studio,/\.gc-app #forms #demo-form \{ border-block-start:3px solid var\(--gc-brand\)/);
  assert.match(studio,/\.gc-app #forms #demo-planned-form \{/);
  assert.match(studio,/@media \(max-width:1080px\)/);
  assert.match(studio,/@media \(forced-colors:active\)/);
  assert.match(html,/id="demo-sort-table"/);
  assert.match(html,/id="demo-tree"/);
  assert.match(html,/id="demo-form"/);
  assert.match(html,/id="demo-planned-form"/);
});


test("display preferences are a native group with an explicit accessible contrast/transparency fieldset",()=>{
  assert.match(html, /class="gc-lab-toolbar-controls" role="group" aria-label="Display preferences"/);
  assert.match(html, /<fieldset class="gc-lab-toolbar-accessibility">\s*<legend>Accessibility<\/legend>/);
  for (const [id,label] of [["contrast","More contrast"],["transparency","Reduce transparency"]]) {
    assert.match(html,new RegExp('<label class="gc-switch gc-lab-'+id+'"><input id="'+id+'" type="checkbox"><span>'+label+'</span></label>'));
  }
  assert.match(studio,/\.gc-app \.gc-lab-toolbar-accessibility-switches/);
  assert.match(studio,/@media \(max-width:360px\)/);
  assert.doesNotMatch(read("lab/app.js"),/window\.localStorage|document\.cookie/);
});

test("foundations use an asymmetric, readable lead panel without new brand tokens",()=>{
  assert.match(studio,/@media \(min-width:1200px\)/);
  assert.match(studio,/\.gc-app #foundations \.gc-lab-foundations > \.gc-card:first-child \{/);
  assert.match(studio,/grid-row:span 2/);
  assert.match(studio,/@media \(max-width:700px\)/);
  const section=html.slice(html.indexOf('<section id="foundations"'),html.indexOf('<section id="premium"'));
  assert.equal([...section.matchAll(/<article class="gc-card"/g)].length,3);
  assert.match(section,/id="demo-custom-accent"/);
  assert.match(section,/id="demo-custom-color"/);
  assert.match(section,/class="gc-lab-color-context"/);
  assert.match(section,/Purposeful emphasis\./);
  assert.match(studio,/\.gc-lab-color-context-chip/);
});
