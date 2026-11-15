import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { initWindowCommandNodes, contrastRatio } from "../src/index.js";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const authority = JSON.parse(read("registry/design-authority.v1.json"));
const tokens = JSON.parse(read("tokens/gc.tokens.json"));

class FakeButton extends EventTarget {
  constructor(action) {
    super();
    this.attributes = new Map([["data-gc-window-command", action]]);
    this.parentElement = null;
    this.textContent = "";
    this.children = [];
    this.disabled = false;
  }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  removeAttribute(key) { this.attributes.delete(key); }
}
class FakeGroup extends EventTarget {
  constructor(buttons) {
    super();
    this.attributes = new Map();
    this.buttons = buttons;
    buttons.forEach(button => { button.parentElement = this; });
  }
  querySelectorAll() { return this.buttons; }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  removeAttribute(key) { this.attributes.delete(key); }
}
const group = () => new FakeGroup(["dismiss", "dock", "expand"].map(action => new FakeButton(action)));
const tick = () => new Promise(resolve => setImmediate(resolve));

test("WCN registry retains official names, action semantics and founder-approved circular shape", () => {
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
  assert.equal(wcn.shapeGeometry, "circle");
  assert.equal(wcn.visibleGlyphs, false);
  assert.equal(wcn.actionSymbols, false);
  assert.equal(wcn.appAccentIndependent, true);
  assert.equal(wcn.faceDiameter, "18px");
  assert.equal(wcn.hitTarget, "44px");
});

test("WCN colors come from shared light/dark alpha tokens with strong contrast", () => {
  const wcn = authority.windowCommandNodes;
  assert.equal(wcn.colorHexValues, "tokens/gc.tokens.json#windowCommandNodes.colors");
  assert.equal(wcn.paletteStatus, "implementation-candidate-pending-founder-visual-review");
  assert.equal(tokens.windowCommandNodes.shape, "circle");
  const css = read("src/tokens.css");
  for (const mode of ["light", "dark"]) {
    const background = tokens.semantic[mode]["surface-tonal"];
    for (const key of ["crimson", "amber", "teal"]) {
      const color = tokens.windowCommandNodes.colors[mode][key];
      assert.match(color, /^#[0-9A-F]{6}$/i);
      assert.ok(contrastRatio(color, background) >= 3, mode + " " + key);
      assert.ok(css.includes("--gc-wcn-" + key + ": " + color + ";"));
    }
  }
  assert.equal(wcn.webControllerStatus, "implemented-alpha");
  assert.equal(wcn.nativeAdapterStatus, "not-implemented");
  assert.equal(authority.nativeSdkStatus, "not-implemented");
  assert.equal(wcn.adoptionStatus, "not-audited");
});

test("unwired, reordered or glyph-bearing nodes are rejected rather than faking OS actions", () => {
  const shell = group();
  assert.throws(() => initWindowCommandNodes(shell), /requires real close/);
  const callbacks = { onDismiss(){}, onDock(){}, onExpand(){} };
  shell.buttons[1].textContent = "−";
  assert.throws(() => initWindowCommandNodes(shell, callbacks), /empty button faces/);
  shell.buttons[1].textContent = "";
  shell.buttons.reverse();
  assert.throws(() => initWindowCommandNodes(shell, callbacks), /Dismiss\/Dock\/Expand order/);
  assert.throws(() => initWindowCommandNodes(group(), { ...callbacks, isMaximized:"yes" }), /boolean/);
});

test("WCN controller dispatches host callbacks and only confirms reported maximize state", async () => {
  const shell = group(), calls = [];
  const ctl = initWindowCommandNodes(shell, {
    onDismiss(ctx) { calls.push(ctx); },
    onDock(ctx) { calls.push(ctx); },
    onExpand(ctx) { calls.push(ctx); return !ctx.maximized; }
  });
  assert.equal(shell.getAttribute("role"), "group");
  assert.equal(shell.buttons[0].getAttribute("aria-label"), "Close window");
  assert.equal(shell.buttons[1].getAttribute("aria-label"), "Minimize window");
  assert.equal(shell.buttons[2].getAttribute("aria-label"), "Maximize window");
  for (const button of shell.buttons) { button.dispatchEvent(new Event("click")); await tick(); }
  assert.deepEqual(calls.map(c => c.action), ["dismiss","dock","expand"]);
  assert.ok(calls.every(c => c.signal instanceof AbortSignal));
  assert.equal(shell.buttons[2].getAttribute("aria-label"), "Restore window");
  shell.buttons[2].dispatchEvent(new Event("click")); await tick();
  assert.equal(shell.buttons[2].getAttribute("aria-label"), "Maximize window");
  ctl.setMaximized(true);
  assert.equal(shell.buttons[2].getAttribute("aria-label"), "Restore window");
  assert.throws(() => ctl.setMaximized("no"), /boolean/);
  ctl.dispose();
  ctl.dispose();
  shell.buttons[0].dispatchEvent(new Event("click")); await tick();
  assert.equal(calls.length, 4);
  assert.throws(() => ctl.setMaximized(false), /disposed/);
});

test("in-flight actions are not duplicated and are aborted on dispose", async () => {
  const shell=group();
  let resolve, count=0, pendingSignal;
  const ctl=initWindowCommandNodes(shell,{
    onDismiss(){}, onDock(){},
    onExpand({signal}){ count++; pendingSignal=signal; return new Promise(done=>{resolve=done;}); }
  });
  shell.buttons[2].dispatchEvent(new Event("click"));
  shell.buttons[2].dispatchEvent(new Event("click"));
  assert.equal(count,1);
  assert.equal(shell.getAttribute("aria-busy"),"true");
  ctl.dispose();
  assert.equal(pendingSignal.aborted,true);
  resolve(true); await tick();
  assert.equal(shell.getAttribute("aria-busy"),null);
});

test("rejected window operations surface a host error without a false success state", async () => {
  const shell=group(), errors=[];
  const ctl=initWindowCommandNodes(shell,{
    onDismiss(){ throw new Error("unsaved work"); },
    onDock(){}, onExpand(){},
    onError(error,action){ errors.push([error.message,action]); }
  });
  shell.buttons[0].dispatchEvent(new Event("click")); await tick();
  assert.equal(shell.getAttribute("data-gc-wcn-error"),"dismiss");
  assert.deepEqual(errors,[["unsaved work","dismiss"]]);
  ctl.dispose();
});

test("WCN CSS and lab honor circles, physical right alignment and no node-face glyphs",()=>{
  const css=read("src/components.css");
  assert.match(css,/\.gc-window__command-nodes\s*\{[^}]*margin-left:auto[^}]*direction:ltr/);
  assert.match(css,/\.gc-window__command-nodes > button\[data-gc-window-command\]\s*\{[^}]*border-radius:50%/);
  assert.match(css,/\.gc-window__command-nodes > button\[data-gc-window-command\]::before\s*\{[^}]*content:""[^}]*inline-size:18px[^}]*border-radius:50%/);
  assert.match(css,/@media \(forced-colors:active\)/);
  const lab=read("lab/index.html");
  assert.match(lab,/id="demo-window-status" role="status"/);
  for(const action of ["dismiss","dock","expand"])
    assert.match(lab,new RegExp('data-gc-window-command="'+action+'"'));
});

test("documentation distinguishes founder circular shape from unverified native adoption",()=>{
  const docs=read(authority.windowCommandNodes.docs);
  const design=read("docs/DESIGN_LANGUAGE.md");
  const components=read("docs/COMPONENTS.md");
  assert.match(docs,/## Window Command Nodes \(WCN\)/);
  assert.match(docs,/\*\*Crimson Node — Dismiss\*\*/);
  assert.match(docs,/\*\*Amber Node — Dock\*\*/);
  assert.match(docs,/\*\*Teal Node — Expand\*\*/);
  assert.match(docs,/node faces are \*\*flat and contain no glyphs/);
  assert.match(docs,/\*\*right-aligned\*\*/);
  assert.match(docs,/faces are circles/);
  assert.match(docs,/unsaved-work/);
  assert.match(docs,/platform-dependent/);
  assert.match(design,/## Signature Window Command Nodes \(WCN\)/);
  assert.match(design,/\*\*glyph-free\*\*/);
  assert.match(components,/## Window Command Nodes \(WCN\)/);
});
