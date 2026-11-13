/** Pure, no-network validation for the proposed web-foundation Stable 1.0 gate. */
export const REQUIRED_RELEASE_GATES=Object.freeze([
  "public-api-contract",
  "reproducible-package",
  "candidate-ci",
  "real-web-acceptance",
  "source-security-privacy",
  "quality-and-recovery",
  "repository-release-controls",
  "release-record"
]);
const shaPattern=/^[a-f0-9]{40}$/;
const fail=(failures,condition,message)=>{if(!condition) failures.push(message);};
const safeHttpsUrl=text=>{
  if(typeof text!=="string" || text.length>2048) return false;
  try{
    const url=new URL(text);
    return url.protocol==="https:" && !!url.hostname && !url.username && !url.password &&
      !["example.com","example.net","example.org","localhost"].includes(url.hostname) &&
      !url.hostname.endsWith(".invalid");
  }catch{return false;}
};
const isValidEvidence=(item,sha)=>{
  if(!item || typeof item!=="object" || Array.isArray(item))return false;
  if(!shaPattern.test(item.sourceSha||"") || item.sourceSha!==sha)return false;
  if(!safeHttpsUrl(item.url))return false;
  if(typeof item.summary!=="string"||item.summary.trim().length<15)return false;
  if(typeof item.testedAt!=="string" || !/^\d{4}-\d{2}-\d{2}T/.test(item.testedAt) ||
    !Number.isFinite(Date.parse(item.testedAt)))return false;
  return true;
};
const exactSet=(expected,actual)=>
  Array.isArray(actual) && actual.length===expected.length &&
  new Set(actual).size===actual.length && expected.every(v=>actual.includes(v));

/**
 * Validates STRUCTURE and referenced evidence metadata only. It cannot attest
 * that a URL exists, a CI run actually passed, or a human tested a real device.
 * Those assertions require an independent review of the referenced evidence.
 */
export function evaluateReleaseReadiness(plan,pkg,{sourceSha=null,cleanTree=false}={}){
  const blockers=[];
  fail(blockers,plan?.schemaVersion===1 && plan?.authority==="GoreeCloud UI",
    "Release schema/authority mismatch");
  fail(blockers,plan?.strategy==="web-first-incremental-stable","Release strategy mismatch");
  fail(blockers,plan?.targetStableVersion==="1.0.0","Unexpected Stable target");
  fail(blockers,plan?.currentPackageVersion===pkg?.version,"Package/plan version mismatch");
  fail(blockers,pkg?.version==="1.0.0","Package is not version 1.0.0");
  fail(blockers,plan?.status==="candidate-verified","Candidate has not been verified");
  const foundation=plan?.webFoundations;
  fail(blockers,foundation?.status==="verified","Web foundation has not been verified");
  fail(blockers,foundation?.rootEntryStatus==="preview-compatibility",
    "Legacy root preview compatibility was not preserved");
  const stable=foundation?.candidateStableExports;
  const preview=foundation?.deferredPreviewExports;
  const review=foundation?.requiringClassification;
  const all=[...(Array.isArray(stable)?stable:[]),...(Array.isArray(preview)?preview:[]),...(Array.isArray(review)?review:[])];
  fail(blockers,Array.isArray(stable)&&stable.includes("./foundation") &&
    Array.isArray(preview)&&preview.includes(".") &&
    Array.isArray(review)&&review.length===0,"Stable/preview entry-point boundary unresolved");
  fail(blockers,pkg?.exports && typeof pkg.exports==="object" && !Array.isArray(pkg.exports) &&
    exactSet(Object.keys(pkg.exports),all),"Public package exports not completely classified");
  const classes=foundation?.rootSymbolClassification;
  fail(blockers,classes && Array.isArray(classes.candidateStable) && Array.isArray(classes.deferredPreview) &&
    classes.candidateStable.length>0 && classes.deferredPreview.length>0 &&
    new Set([...classes.candidateStable,...classes.deferredPreview]).size===
      classes.candidateStable.length+classes.deferredPreview.length,
    "Stable/preview root symbol classification incomplete");
  fail(blockers,shaPattern.test(sourceSha||""),"Exact release candidate source SHA unavailable");
  fail(blockers,cleanTree===true,"Release candidate working tree is not verified clean");
  const gates=plan?.gates;
  const ids=Array.isArray(gates)?gates.map(g=>g?.id):[];
  fail(blockers,exactSet(REQUIRED_RELEASE_GATES,ids),
    "Mandatory release gate inventory changed");
  for(const id of REQUIRED_RELEASE_GATES){
    const gate=Array.isArray(gates)?gates.find(g=>g?.id===id):null;
    if(!gate) {blockers.push("Missing mandatory gate: "+id);continue;}
    if(gate.blocking!==true){blockers.push("Mandatory gate disabled: "+id);continue;}
    if(gate.status!=="verified"){blockers.push("Open gate: "+id);continue;}
    if(!Array.isArray(gate.evidence)||gate.evidence.length===0){
      blockers.push("Missing evidence: "+id);continue;
    }
    if(gate.evidence.some(e=>!isValidEvidence(e,sourceSha))){
      blockers.push("Invalid or stale evidence: "+id);
    }
  }
  return {target:plan?.targetStableVersion,current:pkg?.version,ready:blockers.length===0,blockers};
}
