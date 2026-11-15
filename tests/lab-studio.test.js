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
