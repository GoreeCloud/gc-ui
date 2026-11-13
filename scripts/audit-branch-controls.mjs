#!/usr/bin/env node
/** Read-only branch-protection and required-check diagnostic. Never changes GitHub. */
import { pathToFileURL } from "node:url";

export const REQUIRED_UI_CHECKS=Object.freeze([
  "source-and-contract (20)",
  "source-and-contract (22)",
  "source-and-contract (24)",
  "browser-smoke",
  "cross-node-package-reproducibility"
]);
const present=(v)=>v!==null && v!==undefined;
export function assessBranchProtection({branch=null,classic=null,rules=null,errors=[]}={}){
  const blockers=[];
  const need=(v,message)=>{if(!v)blockers.push(message);};
  need(branch?.name==="main" && branch?.protected===true,
    "main is not confirmed protected by GitHub branch metadata");
  const active=Array.isArray(rules)?rules:[];
  const hasRule=type=>active.some(r=>r?.type===type);
  const ruleChecks=active.filter(r=>r?.type==="required_status_checks")
    .flatMap(r=>Array.isArray(r.parameters?.required_status_checks)?
      r.parameters.required_status_checks.map(c=>c?.context):[]);
  const classicChecks=[
    ...(Array.isArray(classic?.required_status_checks?.contexts)?
      classic.required_status_checks.contexts:[]),
    ...(Array.isArray(classic?.required_status_checks?.checks)?
      classic.required_status_checks.checks.map(c=>c?.context):[])
  ];
  const requiredNames=new Set([...ruleChecks,...classicChecks].filter(v=>typeof v==="string"));
  for(const name of REQUIRED_UI_CHECKS)
    need(requiredNames.has(name),"Required CI check missing: "+name);
  const classicStrict=classic?.required_status_checks?.strict===true;
  const rulesStrict=active.some(r=>r?.type==="required_status_checks" &&
    r.parameters?.strict_required_status_checks_policy===true);
  need(classicStrict||rulesStrict,
    "Require PR checks against the latest target branch revision");
  need(present(classic?.required_pull_request_reviews)||hasRule("pull_request"),
    "A pull request merge rule is not verified");
  const noForce=classic?.allow_force_pushes?.enabled===false || hasRule("non_fast_forward");
  const noDelete=classic?.allow_deletions?.enabled===false || hasRule("deletion");
  need(noForce,"Force pushes are not verified blocked");
  need(noDelete,"Branch deletion is not verified blocked");
  // For classic branch protection, admin enforcement is explicit.
  // Effective rulesets may have bypass actors; do not certify them from the
  // aggregated rules list alone.
  const ownerEnforcement=classic?.enforce_admins?.enabled===true;
  need(ownerEnforcement,
    "Admin/bypass enforcement is unverified; inspect owner rulesets or classic enforce_admins");
  if(!Array.isArray(rules) && !classic)
    blockers.push("Neither rules nor detailed protection could be inspected");
  if(Array.isArray(errors) && errors.length)
    blockers.push(...errors.map(e=>"GitHub API inspection incomplete: "+String(e)));
  return Object.freeze({
    status:blockers.length?"release-controls-unverified":"configuration-observed-owner-negative-test-required",
    readyForOwnerNegativeTest:blockers.length===0,
    approvalForStableRelease:false,
    checkedStatuses:[...requiredNames].sort(),
    requiredStatuses:[...REQUIRED_UI_CHECKS],
    blockers
  });
}
async function request(relativePath,token){
  const url="https://api.github.com/repos/GoreeCloud/gc-ui/"+relativePath;
  const headers={
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2026-03-10",
    "User-Agent":"GoreeCloud-UI-release-protection-audit"
  };
  if(token)headers.Authorization="Bearer "+token;
  const response=await fetch(url,{method:"GET",headers,redirect:"error",
    signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error("GET "+relativePath+" returned HTTP "+response.status);
  const body=await response.text();
  if(body.length>524288)throw new Error("GitHub metadata too large: "+relativePath);
  return JSON.parse(body);
}
export async function inspectRepositoryProtection(token){
  // No mutation; authentication is optional. Never log token/headers.
  const paths=[
    ["branch","branches/main"],
    ["classic","branches/main/protection"],
    ["rules","rules/branches/main"]
  ];
  const rs=await Promise.all(paths.map(async ([name,path])=>{
    try{return {name,data:await request(path,token),error:null};}
    catch(error){return {name,data:null,error:name+" read "+String(error.message||error)};}
  }));
  const data=Object.fromEntries(rs.map(x=>[x.name,x.data]));
  return assessBranchProtection({...data,errors:rs.filter(x=>x.error).map(x=>x.error)});
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv.length!==2 && !(process.argv.length===3&&process.argv[2]==="--json")){
    console.error("Usage: node scripts/audit-branch-controls.mjs [--json]");
    process.exit(2);
  }
  try{
    const report=await inspectRepositoryProtection(process.env.GITHUB_TOKEN||process.env.GH_TOKEN||null);
    console.log(JSON.stringify(report,null,2));
    if(!report.readyForOwnerNegativeTest)process.exitCode=1;
  }catch(error){
    console.error("GitHub release control audit failed closed: "+String(error.message||error));
    process.exitCode=1;
  }
}
