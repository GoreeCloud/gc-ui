import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath, pathToFileURL} from "node:url";
import {resolve} from "node:path";
export function buildStyles(registry){
  function toKebab(s){return s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();}
  function toCssValue(token){
    const v=token.$value;
    if(token.$type==="cubicBezier")return "cubic-bezier("+v.join(",")+")";
    if(token.$type==="fontFamily")return v.map(x=>/\s/.test(x)?'"'+x+'"':x).join(", ");
    return String(v);
  }
  function walk(obj,prefix){
    let out=[];
    for(const [key,child] of Object.entries(obj)){
      if(key.startsWith("$"))continue;
      const next=prefix+"-"+toKebab(key);
      if(child && typeof child==="object" && Object.prototype.hasOwnProperty.call(child,"$value")){
        out.push("  --gc-v1"+next+": "+toCssValue(child)+";");
      }else if(child && typeof child==="object"){out.push(...walk(child,next));}
    }
    return out;
  }
  const lines=["/* Generated from tokens/gc.v1.tokens.json. DO NOT EDIT. */"];
  lines.push(":root {",...walk(registry.foundation,"-foundation"),...walk(registry.component,"-component"),...walk(registry.color.light,"-color"),"}");
  lines.push(':root[data-gc-mode="dark"] {',...walk(registry.color.dark,"-color"),"}");
  for(const [name,entry] of Object.entries(registry.color.accent)){
    lines.push(':root[data-gc-accent="'+name+'"] {',...walk(entry.light,"-color"),"}");
    lines.push(':root[data-gc-mode="dark"][data-gc-accent="'+name+'"] {',...walk(entry.dark,"-color"),"}");
  }
  lines.push("@media (forced-colors: active) { :root { --gc-v1-color-focus-ring: Highlight; --gc-v1-color-on-surface: CanvasText; --gc-v1-color-surface: Canvas; --gc-v1-color-canvas: Canvas; } }");
  lines.push("@media (prefers-reduced-motion: reduce) { :root { --gc-v1-foundation-motion-duration-immediate: 0ms; --gc-v1-foundation-motion-duration-fast: 0ms; --gc-v1-foundation-motion-duration-standard: 0ms; --gc-v1-foundation-motion-duration-entrance: 0ms; --gc-v1-foundation-motion-duration-expansive: 0ms; --gc-v1-foundation-motion-duration-exit: 0ms; } }");
  return lines.join("\n")+"\n";
}
const here=resolve(fileURLToPath(new URL("..",import.meta.url)));
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const source=JSON.parse(readFileSync(resolve(here,"tokens/gc.v1.tokens.json"),"utf8"));
  const output=buildStyles(source);
  const dest=resolve(here,"styles/gc.v1.generated.css");
  if(process.argv.includes("--check")){
    if(readFileSync(dest,"utf8")!==output){console.error("GC UI generated CSS is out of date.");process.exit(1);}
    console.log("GC UI v1 CSS is current.");
  }else{
    writeFileSync(dest,output);
    console.log("GC UI v1 CSS generated.");
  }
}
