/**
 * Fail-closed provenance: a Git SHA only describes packed files when the
 * exact source checkout is clean both before and after offline packaging.
 * Never prints untracked filenames or secret-bearing file content.
 */
import {execFileSync} from "node:child_process";
import {isAbsolute} from "node:path";
const commitPattern=/^[a-f0-9]{40}$/;
export function assertCleanGitCheckout(directory){
 if(typeof directory!=="string" || !isAbsolute(directory))
   throw new TypeError("Expected absolute source checkout path");
 const read=(...args)=>execFileSync("git",["-C",directory,...args],{
   encoding:"utf8",timeout:8000,maxBuffer:1024*1024
 }).trim();
 try{
   const head=read("rev-parse","--verify","HEAD");
   if(!commitPattern.test(head))throw new Error("Invalid Git commit revision");
   const status=read("status","--porcelain=v1","--untracked-files=normal");
   if(status!=="")throw new Error("Source checkout is dirty; exact Git SHA cannot represent packed bytes");
   return head;
 }catch(error){
   if(error?.message?.startsWith("Source checkout is dirty") ||
      error?.message==="Invalid Git commit revision")throw error;
   throw new Error("Source checkout cannot be independently verified as clean");
 }
}
