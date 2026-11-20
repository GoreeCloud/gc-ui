#!/usr/bin/env node
// Deterministic, dependency-free Compose adapter generator. No network access.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const target=join(root,"android/material3-expressive/gc-ui-compose/src/main/java/com/goreecloud/ui/material3/GeneratedGoreePalettes.kt");
const tokens=JSON.parse(readFileSync(join(root,"tokens/gc.tokens.json"),"utf8"));
const args=process.argv.slice(2);
if(args.length!==1||!["--check","--write"].includes(args[0]))throw Error("Usage: --check or --write");
function argb(s){
 if(/^#[A-Fa-f0-9]{6}$/.test(s))return ("FF"+s.slice(1)).toUpperCase();
 const p=/^rgba\((\d+),(\d+),(\d+),([0-9.]+)\)$/.exec(s.replaceAll(" ",""));
 if(!p)throw Error("invalid color "+s);
 return [Math.round(Number(p[4])*255),...p.slice(1,4).map(Number)].map(n=>n.toString(16).padStart(2,"0")).join("").toUpperCase();
}
function gen(t){
 const rows=["// Generated from tokens/gc.tokens.json. Do not edit.","package com.goreecloud.ui.material3","","internal object GeneratedGoreePalettes {","    val palettes: Map<String, Map<String, Long>> = mapOf("];
 for(const a of ["iris","lagoon","ember","moss"])for(const m of ["light","dark"]){
  rows.push('        "'+a+'/'+m+'" to mapOf(');
  for(const [k,v] of Object.entries({...t.semantic[m],...t.accents[a][m]}))rows.push('            "'+k+'" to 0x'+argb(v)+'L,');
  rows.push("        ),");
 }
 rows.push("    )","}","");
 return rows.join("\n");
}
const output=gen(tokens);
if(args[0]==="--check"){
 if(readFileSync(target,"utf8")!==output)throw Error("Stale Compose tokens, run --write");
 console.log("Canonical Compose tokens verified");
}else{
 mkdirSync(dirname(target),{recursive:true});
 writeFileSync(target,output,"utf8");
 console.log("Generated Compose tokens");
}
