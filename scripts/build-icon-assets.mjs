#!/usr/bin/env node
/** Deterministic offline sprite and icon registry generation. */
import { readFileSync,writeFileSync,mkdirSync } from "node:fs";
import { ICON_NAMES,iconSvg } from "../src/icons.js";
import { fileURLToPath } from "node:url";
function renderSprite(entries) {
  const symbols=entries.map(({name,body})=>{
    if(!/^[A-Za-z][A-Za-z0-9]*$/.test(name)||/script|onload|onclick|<style/i.test(body))throw new Error("Unsafe glyph");
    return '  <symbol id="gc-icon-'+name+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+body+'</symbol>';
  }).join("\n");
  return '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated from original src/icons.js glyphs. Do not edit. -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n'+symbols+'\n</svg>\n';
}
function renderRegistry(entries) {
  return JSON.stringify({schemaVersion:1,authority:"GoreeCloud UI",style:"original-uniform-24px-line-glyphs",
    viewBox:"0 0 24 24",strokeWidth:1.8,count:entries.length,defaultAccessibility:"decorative; label icon-only controls",
    icons:entries.map(({name})=>({name,symbolId:"gc-icon-"+name}))},null,2)+"\n";
}
const entries=ICON_NAMES.map(name=>{
  const match=iconSvg(name).match(/^<svg[^>]*>([\s\S]*?)<\/svg>$/);
  if(!match)throw new Error("Unexpected glyph serialization: "+name);
  return {name,body:match[1]};
});
const mode=process.argv.slice(2);
if(mode.length!==1||!["--check","--write"].includes(mode[0]))throw new Error("Choose --check or --write");
const root=new URL("../",import.meta.url);
const targets=[["assets/gc-icons.svg",renderSprite(entries)],["assets/gc-icons.json",renderRegistry(entries)]];
if(mode[0]==="--write")mkdirSync(fileURLToPath(new URL("assets/",root)),{recursive:true});
for(const [path,content] of targets){
  const dest=fileURLToPath(new URL(path,root));
  if(mode[0]==="--write")writeFileSync(dest,content,"utf8");
  else{let actual;try{actual=readFileSync(dest,"utf8")}catch{throw new Error("Missing icon resource "+path)}
    if(actual!==content)throw new Error("Stale icon resource "+path+"; run npm run icons:generate")}
}
console.log(mode[0]==="--check"?"GC UI icon assets match source glyphs":"GC UI icon assets generated: "+entries.length+" original glyphs");
