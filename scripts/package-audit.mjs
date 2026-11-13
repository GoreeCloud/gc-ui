/** Pure, strict package export-map validator for offline release evidence. */
const targetPattern = /^\.\/(src|tokens|assets)\/[a-zA-Z0-9._/-]+$/;
const reserved = new Set(["__proto__","constructor","prototype"]);
export function auditPackageExports(pkg, filePaths) {
  if(!pkg || typeof pkg!=="object" || !pkg.exports || typeof pkg.exports!=="object" ||
    Array.isArray(pkg.exports)) throw new TypeError("Package must have a static exports map");
  if(pkg.name!=="@goreecloud/ui" || typeof pkg.version!=="string") {
    throw new Error("Unexpected GoreeCloud package identity");
  }
  if(pkg.dependencies && Object.keys(pkg.dependencies).length>0)
    throw new Error("Shared foundations must not silently introduce runtime dependencies");
  if(!(filePaths instanceof Set)) throw new TypeError("Supply packed file paths as a Set");
  for(const required of ["package.json","LICENSE","README.md"]) {
    if(!filePaths.has(required)) throw new Error("Missing package metadata: "+required);
  }
  const exports=[];
  const seen = new Set();
  for(const [key,value] of Object.entries(pkg.exports)) {
    if(key!=="." && !/^\.\/[a-z][a-z0-9./-]*$/.test(key))
      throw new Error("Invalid public export specifier: "+key);
    if(seen.has(key)||reserved.has(key))throw new Error("Duplicate or forbidden export: "+key);
    seen.add(key);
    if(typeof value==="string"){
      exports.push({specifier:key,target:value,kind:"asset"});
    }else if(value && typeof value==="object" && !Array.isArray(value) &&
      Object.keys(value).length===2 && typeof value.types==="string" &&
      typeof value.default==="string"){
      if(!value.default.endsWith(".js") || !value.types.endsWith(".d.ts"))
        throw new Error("Invalid JS/type pair for "+key);
      exports.push({specifier:key,target:value.default,kind:"js",types:value.types});
    }else{
      throw new Error("Unrecognized export shape for "+key);
    }
  }
  if(!exports.some(x=>x.specifier==="."))throw new Error("Missing legacy root entry");
  const checkPath=(path,key)=>{
    if(typeof path!=="string" || !targetPattern.test(path) ||
      path.split("/").includes("..") || path.endsWith("/") || path.includes("//"))
      throw new Error("Unsafe package path for "+key+": "+path);
    if(!filePaths.has(path.slice(2)))
      throw new Error("Export "+key+" points to missing packed file: "+path);
  };
  for(const entry of exports){
    checkPath(entry.target,entry.specifier);
    if(entry.kind==="js") checkPath(entry.types,entry.specifier+" types");
  }
  return Object.freeze(exports.map(entry=>Object.freeze(entry)));
}

/** Enforce functional glyphs only in distributable npm archives. */
export function auditPackedBrandBoundary(filePaths){
  if(!(filePaths instanceof Set))throw new TypeError("Expected npm pack file inventory Set");
  for(const asset of ["assets/gc-icons.json","assets/gc-icons.svg"]){
    if(!filePaths.has(asset))throw new Error("Missing required public glyph asset: "+asset);
  }
  for(const path of filePaths){
    if(typeof path!=="string")throw new TypeError("Invalid packed file path");
    if(path==="assets/identity" || path.startsWith("assets/identity/"))
      throw new Error("Official identity artwork must not be bundled in the public UI package: "+path);
  }
  return true;
}

/**
 * Minimal, runtime-only npm distribution policy.
 * Future public assets require an explicit review of this allowlist.
 */
export function auditPackedRuntimeBoundary(filePaths){
  if(!(filePaths instanceof Set)) throw new TypeError("Expected packed Set");
  const root=new Set(["package.json","LICENSE","README.md",
    "tokens/gc.tokens.json","assets/gc-icons.json","assets/gc-icons.svg"]);
  const allowed=path=>root.has(path) ||
    /^src\/[a-z0-9-]+(?:\.d)?\.(?:js|ts|css)$/.test(path);
  for(const path of filePaths){
    if(typeof path!=="string" || !allowed(path))
      throw new Error("Non-runtime file in public UI package: "+String(path));
  }
  if(!filePaths.has("src/foundation.js") || !filePaths.has("src/foundation.d.ts") ||
    !filePaths.has("src/tokens.css") || !filePaths.has("tokens/gc.tokens.json"))
    throw new Error("Missing minimal web foundation files");
  return true;
}
