#!/usr/bin/env node
import { readFileSync,writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
function renderCss(t){
 if(!t?.foundations||!t?.semantic?.light||!t?.semantic?.dark||!t?.accents?.iris)throw new Error("Missing GoreeCloud token sections");
 const b=t.foundations;
 const primitives={"font-ui":b.type.fontFamily,"font-mono":b.type.mono,"type-display":b.type.display,"type-title":b.type.title,"type-section":b.type.section,"type-heading":b.type.heading,"type-body":b.type.body,"type-support":b.type.support,"type-label":b.type.label,"line-body":b.type.lineBody,
 "radius-sm":b.radius.sm,"radius-md":b.radius.md,"radius-lg":b.radius.lg,"radius-xl":b.radius.xl,"radius-full":b.radius.full,
 "motion-fast":b.motion.fast,"motion-base":b.motion.base,"motion-slow":b.motion.slow,"ease":b.motion.ease,"ease-expressive":b.motion.expressive,
 "shadow-0":b.elevation.zero,"shadow-1":b.elevation.one,"shadow-2":b.elevation.two,"shadow-3":b.elevation.three,"shadow-4":b.elevation.four,
 "icon-sm":b.icon.sm,"icon-md":b.icon.md,"icon-lg":b.icon.lg,"icon-xl":b.icon.xl,"icon-stroke":b.icon.stroke,
 "control-min":b.size.control,"control-lg":b.size.controlLarge,"touch-min":b.size.touch,"blur-lens":b.blur.lens,
 "opacity-disabled":b.opacity.disabled,"content-readable":b.content.readable,"content-wide":b.content.wide,
 "z-sticky":b.z.sticky,"z-dropdown":b.z.dropdown,"z-lens":b.z.lens,"z-dialog":b.z.dialog,"z-toast":b.z.toast,
 "breakpoint-compact":b.breakpoint.compact,"breakpoint-medium":b.breakpoint.medium,"breakpoint-expanded":b.breakpoint.expanded};
 for(const [name,value] of Object.entries(b.space))primitives["space-"+name]=value;
 const decl=o=>Object.entries(o).map(([k,v])=>{
  if(!/^[a-z0-9-]+$/i.test(k)||!["string","number"].includes(typeof v)||/[;}\n]/.test(String(v)))throw new Error("Unsafe token "+k);
  return "  --gc-"+k+": "+v+";";
 }).join("\n");
 const block=(selector,values,extra="")=>selector+" {\n"+decl(values)+(extra?"\n  "+extra:"")+"\n}\n";
 let css="/* Generated from tokens/gc.tokens.json by scripts/generate-web-tokens.mjs — DO NOT EDIT. */\n";
 css+=block(":root, .gc-app[data-gc-theme]",{...primitives,...t.semantic.light,...t.accents.iris.light},"color-scheme: light;");
 for(const [family,modes] of Object.entries(t.accents))if(family!=="iris")css+=block(':root[data-gc-accent="'+family+'"], .gc-app[data-gc-theme][data-gc-accent="'+family+'"]',modes.light);
 css+=block(':root[data-gc-theme="dark"], .gc-app[data-gc-theme="dark"]',{...t.semantic.dark,...t.accents.iris.dark},"color-scheme: dark;");
 for(const [family,modes] of Object.entries(t.accents))if(family!=="iris")css+=block(':root[data-gc-theme="dark"][data-gc-accent="'+family+'"], .gc-app[data-gc-theme="dark"][data-gc-accent="'+family+'"]',modes.dark);
 css+="@media (prefers-color-scheme: dark) {\n";
 css+=block('  :root:not([data-gc-theme]), :root[data-gc-theme="auto"], .gc-app[data-gc-theme="auto"]',{...t.semantic.dark,...t.accents.iris.dark},"color-scheme: dark;");
 for(const [family,modes] of Object.entries(t.accents))if(family!=="iris")css+=block('  :root:not([data-gc-theme])[data-gc-accent="'+family+'"], :root[data-gc-theme="auto"][data-gc-accent="'+family+'"], .gc-app[data-gc-theme="auto"][data-gc-accent="'+family+'"]',modes.dark);
 css+="}\n";
 css+=':root[data-gc-contrast="more"], .gc-app[data-gc-theme][data-gc-contrast="more"] { --gc-lens-fill: var(--gc-lens-solid); --gc-outline-soft: var(--gc-outline); --gc-shadow-1: none; --gc-shadow-2: none; --gc-shadow-3: none; --gc-shadow-4: none; }\n';
 css+='@media (prefers-contrast: more) { :root:not([data-gc-contrast="normal"]), .gc-app[data-gc-theme]:not([data-gc-contrast="normal"]) { --gc-lens-fill: var(--gc-lens-solid); --gc-outline-soft: var(--gc-outline); } }\n';
 css+='@media (prefers-reduced-transparency: reduce) { :root, .gc-app[data-gc-theme] { --gc-lens-fill: var(--gc-lens-solid); --gc-blur-lens: 0px; } }\n';
 css+='@media (prefers-reduced-motion: reduce) { :root, .gc-app[data-gc-theme] { --gc-motion-fast: 0ms; --gc-motion-base: 0ms; --gc-motion-slow: 0ms; } }\n';
 return css;
}
const args=process.argv.slice(2);
if(args.length!==1||!["--write","--check"].includes(args[0]))throw new Error("Choose --write or --check");
const base=new URL("../",import.meta.url);
const source=JSON.parse(readFileSync(new URL("tokens/gc.tokens.json",base),"utf8"));
const result=renderCss(source);
const target=fileURLToPath(new URL("src/tokens.css",base));
if(args[0]==="--write"){writeFileSync(target,result,"utf8");console.log("Browser token stylesheet generated")}
else{let existing;try{existing=readFileSync(target,"utf8")}catch{throw new Error("Browser token stylesheet missing")}
if(existing!==result)throw new Error("Stale browser stylesheet: run npm run tokens:generate");
console.log("Browser token stylesheet matches source JSON")}
