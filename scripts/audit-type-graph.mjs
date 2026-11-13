/**
 * Static exact-name declaration graph audit from installed npm tarball.
 * This is NOT a semantic TypeScript compiler or type correctness certification.
 */
import {posix} from "node:path";
const ID=/^[a-zA-Z_$][\w$]*$/;
const names=x=>x.split(",").map(y=>y.trim().split(/\s+as\s+/).pop().trim())
  .filter(Boolean).map(y=>{if(!ID.test(y))throw Error("Unknown symbol syntax: "+y);return y;});
const equal=(a,b)=>a.size===b.size&&[...a].every(x=>b.has(x));
export function auditTypeGraph(pkg,files,read){
 if(!pkg?.exports || !(files instanceof Set)||typeof read!=="function")
   throw new TypeError("Need package manifest, installed package files and reader");
 const source=p=>{
   if(!files.has(p))throw Error("Missing packed public source: "+p);
   const s=read(p);
   if(typeof s!=="string"||s.length<1||s.length>512000)throw Error("Invalid installed text file: "+p);
   return s;
 };
 const target=(from,ref)=>{
   if(!/^\.\.?\//.test(ref)||!ref.endsWith(".js"))
     throw Error("External declaration dependency: "+from+" -> "+ref);
   const resolved=posix.normalize(posix.join(posix.dirname(from),ref)).replace(/\.js$/,".d.ts");
   if(resolved.startsWith("../")||resolved.startsWith("/")||!files.has(resolved))
     throw Error("Unpacked declaration import: "+resolved);
   return resolved;
 };
 const cache=new Map(),active=new Set();
 function declaration(file){
   if(cache.has(file))return cache.get(file);
   if(active.has(file))throw Error("Circular declaration imports: "+file);
   active.add(file);
   const s=source(file),values=new Set(),types=new Set();
   if(/\/\/\/\s*<reference\b|\bimport\s*\(/.test(s))
     throw Error("Unreviewed TypeScript reference or dynamic dependency: "+file);
   for(const m of s.matchAll(/\bexport\s+(?:declare\s+)?(const|function|class|enum|interface|type)\s+([A-Za-z_$][\w$]*)/g))
     (m[1]==="interface"||m[1]==="type"?types:values).add(m[2]);
   for(const m of s.matchAll(/\bexport\s+(type\s+)?\{\s*([^}]+)\s*\}\s*from\s*["']([^"']+)["']/g)){
     const child=declaration(target(file,m[3])),typeOnly=!!m[1];
     for(const name of names(m[2])){
       if(!(typeOnly?child.types:child.values).has(name))
         throw Error("Undeclared TypeScript re-export: "+file+" -> "+name);
       (typeOnly?types:values).add(name);
     }
   }
   for(const m of s.matchAll(/\bfrom\s*["']([^"']+)["']/g))target(file,m[1]);
   active.delete(file);
   const record={values,types};cache.set(file,record);return record;
 }
 function jsExports(file){
   const s=source(file),values=new Set();
   for(const m of s.matchAll(/\bexport\s+(?:async\s+)?(?:const|function|class|let|var)\s+([A-Za-z_$][\w$]*)/g))values.add(m[1]);
   for(const m of s.matchAll(/\bexport\s*\{\s*([^}]+)\s*\}\s*from\s*["'][^"']+["']/g))
     for(const n of names(m[1]))values.add(n);
   return values;
 }
 const entries=[];
 for(const [key,map] of Object.entries(pkg.exports)){
   if(!map||typeof map!=="object"||Array.isArray(map))continue;
   if(typeof map.types!=="string"||typeof map.default!=="string"||
      !map.types.startsWith("./")||!map.default.startsWith("./"))
     throw Error("Unexpected TS/JS entry map: "+key);
   const runtime=jsExports(map.default.slice(2)),types=declaration(map.types.slice(2)).values;
   if(!runtime.size||!equal(runtime,types))
     throw Error("JS/type value API mismatch "+key+"; missing="+
       [...runtime].filter(x=>!types.has(x)).join(",")+"; unexpected="+
       [...types].filter(x=>!runtime.has(x)).join(","));
   entries.push({path:key,values:runtime.size});
 }
 if(!entries.some(x=>x.path===".")||!entries.some(x=>x.path==="./foundation"))
   throw Error("Missing expected web foundation or root declaration");
 return {entryCount:entries.length,declarationFileCount:cache.size,entries};
}
