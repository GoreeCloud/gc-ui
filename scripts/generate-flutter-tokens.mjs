#!/usr/bin/env node
// Pure deterministic Flutter token generator; no network or third-party code.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const input=join(root,"tokens/gc.tokens.json");
const dest=join(root,"flutter/gc_ui_expressive/lib/src/generated/gc_ui_palettes.g.dart");
if(process.argv.length!==3||!["--write","--check"].includes(process.argv[2]))throw Error("Use --write or --check");
function argb(v){
 if(/^#[0-9a-f]{6}$/i.test(v))return "FF"+v.slice(1).toUpperCase();
 const m=/^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(0?\.\d+|1(?:\.0+)?)\s*\)$/.exec(v);
 if(!m)throw Error("Invalid color "+v);
 return [Math.round(Number(m[4])*255),...m.slice(1,4).map(Number)].map(n=>n.toString(16).padStart(2,"0")).join("").toUpperCase();
}
function render(t){
 const out=["// GENERATED from tokens/gc.tokens.json by scripts/generate-flutter-tokens.mjs.","// DO NOT EDIT. Canonical roles retain their original values.","const Map<String, Map<String, int>> generatedGoreePalettes = {"];
 for(const a of ["iris","lagoon","ember","moss"])for(const m of ["light","dark"]){
  out.push("  '"+a+"/"+m+"': {");
  for(const [role,color] of Object.entries({...t.semantic[m],...t.accents[a][m]}))out.push("    '"+role+"': 0x"+argb(color)+",");
  out.push("  },");
 }
 out.push("};","");
 return out.join("\n");
}
const desired=render(JSON.parse(readFileSync(input,"utf8")));
if(process.argv[2]==="--check"){
 if(readFileSync(dest,"utf8")!==desired)throw Error("Flutter palettes drifted; regenerate with --write");
 console.log("Flutter canonical tokens match");
}else{
 mkdirSync(dirname(dest),{recursive:true});
 writeFileSync(dest,desired);
 console.log("Generated Flutter palettes");
}
