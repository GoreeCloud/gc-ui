#!/usr/bin/env node
// Deterministic Kotlin Compose palette generation from the sole canonical token manifest.
// Offline, dependency-free, no telemetry and no hidden Android-vs-iOS palette divergence.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const root=fileURLToPath(new URL("../",import.meta.url));
const tokens=JSON.parse(readFileSync(join(root,"tokens/gc.tokens.json"),"utf8"));
const args=process.argv.slice(2);
if(args.length!==1||!["--check","--write"].includes(args[0]))throw Error("Usage: --check or --write");
if(tokens.meta?.name!=="GoreeCloud UI")throw Error("Unexpected design authority");

const targets=[
  ["android/material3-expressive/gc-ui-compose/src/main/java/com/goreecloud/ui/material3/GeneratedGoreePalettes.kt","com.goreecloud.ui.material3"],
  ["compose-multiplatform/gc-ui-compose/src/commonMain/kotlin/com/goreecloud/ui/multiplatform/GeneratedGoreePalettes.kt","com.goreecloud.ui.multiplatform"]
];
function argb(s) {
  if(/^#[A-Fa-f0-9]{6}$/.test(s))return ("FF"+s.slice(1)).toUpperCase();
  const p=/^rgba\((\d+),(\d+),(\d+),([0-9.]+)\)$/.exec(s.replaceAll(" ",""));
  if(!p)throw Error("invalid color "+s);
  const v=p.slice(1,4).map(Number),a=Number(p[4]);
  if(v.some(n=>n<0||n>255)||!Number.isFinite(a)||a<0||a>1)throw Error("invalid color components "+s);
  return [Math.round(a*255),...v].map(n=>n.toString(16).padStart(2,"0")).join("").toUpperCase();
}
function gen(t,pkg) {
  const rows=["// Generated from tokens/gc.tokens.json. Do not edit.","package "+pkg,"","internal object GeneratedGoreePalettes {","    val palettes: Map<String, Map<String, Long>> = mapOf("];
  for(const a of ["iris","lagoon","ember","moss"])for(const m of ["light","dark"]){
    if(!t.semantic?.[m]||!t.accents?.[a]?.[m])throw Error("Missing canonical accent/mode "+a+"/"+m);
    rows.push('        "'+a+'/'+m+'" to mapOf(');
    for(const [k,v] of Object.entries({...t.semantic[m],...t.accents[a][m]}))rows.push('            "'+k+'" to 0x'+argb(v)+'L,');
    rows.push("        ),");
  }
  rows.push("    )","}","");
  return rows.join("\n");
}
for(const [relative,pkg] of targets) {
  const target=join(root,relative);
  const output=gen(tokens,pkg);
  if(args[0]==="--check"){
    if(readFileSync(target,"utf8")!==output)throw Error("Stale Compose tokens at "+relative+". Run --write");
  }else{
    mkdirSync(dirname(target),{recursive:true});
    writeFileSync(target,output,"utf8");
  }
}
console.log(args[0]==="--check"?"Canonical Compose tokens verified":"Generated Android and Compose Multiplatform palettes");
