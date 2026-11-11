#!/usr/bin/env node
/**
 * GoreeCloud UI: alpha palette contrast screening.
 * Evaluates solid semantic pairs; transparent lenses and rendered composites
 * MUST still be checked in actual apps on real backdrops.
 */
import { readFileSync } from "node:fs";
const source=JSON.parse(readFileSync(new URL("../tokens/gc.tokens.json",import.meta.url),"utf8"));
function luminance(value){
  if(typeof value!=="string"||!/^#[a-f0-9]{6}$/i.test(value))throw new TypeError("Contrast inputs must be six-digit opaque hex");
  const values=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255)
    .map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return values[0]*.2126+values[1]*.7152+values[2]*.0722;
}
function ratio(foreground,background){
  const a=luminance(foreground),b=luminance(background);
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
const checks=[], failures=[];
function check(palette,mode,foreground,background,minimum){
  const a=palette[foreground],b=palette[background];
  if(!a||!b)throw new Error("Missing pair "+foreground+"/"+background+" for "+mode);
  const measured=ratio(a,b);
  const record={mode,pair:foreground+"/"+background,ratio:Math.round(measured*100)/100,minimum,passed:measured>=minimum};
  checks.push(record);
  if(!record.passed)failures.push(record);
}
for(const mode of ["light","dark"]){
  const palette=source.semantic[mode];
  for(const textRole of ["text","text-soft","positive","warning","negative"]){
    for(const surfaceRole of ["canvas","surface","surface-tonal"])check(palette,mode,textRole,surfaceRole,4.5);
  }
  for(const [fore,back] of [["on-positive","positive"],["on-warning","warning"],["on-negative","negative"]])check(palette,mode,fore,back,4.5);
  for(const bg of ["canvas","surface","surface-tonal"])check(palette,mode,"focus-ring",bg,3);
}
for(const [accent,themes] of Object.entries(source.accents)){
  for(const mode of ["light","dark"]){
    const palette={...source.semantic[mode],...themes[mode]};
    for(const background of ["canvas","surface","surface-tonal"])check(palette,accent+"/"+mode,"brand",background,4.5);
    check(palette,accent+"/"+mode,"on-brand","brand",4.5);
    check(palette,accent+"/"+mode,"on-brand-container","brand-container",4.5);
  }
}
const report={
  authority:"GoreeCloud UI",version:source.meta.version,tested:checks.length,
  passed:checks.length-failures.length,failed:failures.length,
  lowestContrast:Math.min(...checks.map(x=>x.ratio)),
  reviewNeeded:["Translucent Lens over actual backgrounds","Essential nontext glyph/outline cases","Hover/disabled/selected states in rendered browsers","Forced colors, OS text scaling and human assistive technology"],
  failures
};
const mode=process.argv[2]||"--check";
if(!["--check","--json"].includes(mode)||process.argv.length>3)throw new Error("Use --check or --json");
if(mode==="--json")console.log(JSON.stringify(report,null,2));
else {
  console.log("GoreeCloud UI alpha contrast screening: "+report.passed+"/"+report.tested+" solid foreground/backdrop pairs passed");
  if(failures.length)console.error(JSON.stringify(failures,null,2));
  console.log("Manual review required for transparency, symbols, OS modes and real devices.");
}
if(failures.length)process.exitCode=1;
