// Dependency-free, exhaustive syntax check for the maintained JavaScript source tree.
// Directory entries are inspected without following symlinks outside this repository.
import {readdirSync} from "node:fs";
import {join, relative, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";

const repositoryRoot=fileURLToPath(new URL("../",import.meta.url));
const sourceDirectories=["src","scripts","lab","tests"];

export function listJavaScriptSources(root=repositoryRoot) {
  const paths=[];
  function visit(directory) {
    for(const entry of readdirSync(directory,{withFileTypes:true})) {
      const target=join(directory,entry.name);
      if(entry.isDirectory()) visit(target);
      else if(entry.isFile() && /\.(?:[cm]?js)$/.test(entry.name)) paths.push(target);
      // Ignore symlinks: never traverse a linked external source tree.
    }
  }
  for(const directory of sourceDirectories) visit(join(root,directory));
  return paths.sort((a,b)=>a.localeCompare(b,"en"));
}

export function checkJavaScriptSyntax(root=repositoryRoot,{execute=spawnSync}={}) {
  const files=listJavaScriptSources(root);
  const failures=[];
  for(const file of files) {
    const result=execute(process.execPath,["--check",file],{encoding:"utf8",timeout:10000,maxBuffer:1024*1024});
    if(result.error || result.status!==0) {
      failures.push({file:relative(root,file),reason:String(result.error?.message || result.stderr || "JavaScript syntax check failed").trim()});
    }
  }
  return {files,failures};
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const {files,failures}=checkJavaScriptSyntax();
    if(failures.length) {
      for(const failure of failures) console.error(`${failure.file}: ${failure.reason}`);
      process.exitCode=1;
    } else console.log(`JavaScript syntax valid: ${files.length} source, script, lab and test files`);
  } catch(error) {
    console.error(`JavaScript syntax audit could not complete: ${error.message}`);
    process.exitCode=1;
  }
}
