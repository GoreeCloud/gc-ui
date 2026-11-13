/**
 * Read-only per-file SHA256 of the exact installed offline npm tarball.
 * Prevents a matching file *size* from masking mutated consumer file bytes.
 */
import { readFileSync,lstatSync } from "node:fs";
import {createHash} from "node:crypto";
import { resolve,sep } from "node:path";
const safePath=/^(?:src\/[a-z0-9][a-z0-9.-]*|tokens\/[a-z0-9][a-z0-9.-]*|assets\/[a-z0-9][a-z0-9.-]*|package\.json|LICENSE|README\.md)$/;
export function digestInstalledFiles(root,packedFiles){
  if(typeof root!=="string"||!root.trim())throw new TypeError("Invalid installed root");
  if(!Array.isArray(packedFiles)||packedFiles.length<1||packedFiles.length>500)
    throw new TypeError("Invalid packed file inventory");
  const absolute=resolve(root),seen=new Set();
  let bytesTotal=0;
  const results=[];
  for(const record of packedFiles){
    const path=record?.path;
    if(typeof path!=="string" || !safePath.test(path) || path.includes("..") || seen.has(path) ||
      !Number.isSafeInteger(record.size)||record.size<1||record.size>8*1024*1024)
      throw new Error("Invalid or duplicate packed file: "+String(path));
    seen.add(path);
    const target=resolve(absolute,path);
    if(!target.startsWith(absolute+sep))
      throw new Error("Packed file escapes installation root: "+path);
    const stat=lstatSync(target);
    if(!stat.isFile() || stat.isSymbolicLink() || stat.size!==record.size)
      throw new Error("Installed package file type/size mismatch: "+path);
    bytesTotal+=stat.size;
    if(bytesTotal>16*1024*1024)throw new Error("Packed package exceeds safety cap");
    const contents=readFileSync(target);
    results.push(Object.freeze({path,size:stat.size,
      sha256:createHash("sha256").update(contents).digest("hex")}));
  }
  return Object.freeze(results.sort((a,b)=>a.path.localeCompare(b.path)));
}
