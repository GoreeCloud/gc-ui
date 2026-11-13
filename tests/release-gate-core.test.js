import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluateReleaseReadiness,REQUIRED_RELEASE_GATES,validateExternalReleaseEvidence } from "../scripts/release-gate-core.mjs";

const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const currentPlan=load("registry/release-plan.v1.json");
const pkg=load("package.json");
const sha="0123456789abcdef0123456789abcdef01234567";
const goodEvidence={
  url:"https://github.com/GoreeCloud/gc-ui/actions/runs/43440375003",
  sourceSha:sha,testedAt:"2026-11-13T14:00:00Z",
  summary:"Source verified on a particular tested release candidate."
};
const clone=v=>JSON.parse(JSON.stringify(v));
const setup=()=>{
  const plan=clone(currentPlan);
  const fakePkg={...clone(pkg),version:"1.0.0"};
  plan.currentPackageVersion="1.0.0";
  plan.status="candidate-verified";
  plan.webFoundations.status="verified";
  for(const gate of plan.gates){
    gate.status="verified";
    gate.evidence=[clone(goodEvidence)];
  }
  return {plan,pkg:fakePkg};
};
const check=(a,options={})=>evaluateReleaseReadiness(a.plan,a.pkg,{
  sourceSha:sha,cleanTree:true,...options
});
test("stable release requires all eight immutable blocking gates",()=>{
  assert.deepEqual(REQUIRED_RELEASE_GATES,currentPlan.gates.map(g=>g.id));
  const candidate=setup();
  assert.equal(check(candidate).ready,true,
    "A formally complete synthetic record must validate before negative tests");
  for(const id of REQUIRED_RELEASE_GATES){
    const missing=setup();missing.plan.gates=missing.plan.gates.filter(g=>g.id!==id);
    assert.equal(check(missing).ready,false,id+" missing");
    const disabled=setup();disabled.plan.gates.find(g=>g.id===id).blocking=false;
    assert.ok(check(disabled).blockers.includes("Mandatory gate disabled: "+id));
    const pending=setup();pending.plan.gates.find(g=>g.id===id).status="open";
    assert.ok(check(pending).blockers.includes("Open gate: "+id));
  }
  const duplicated=setup();duplicated.plan.gates.push(clone(duplicated.plan.gates[0]));
  assert.equal(check(duplicated).ready,false);
});
test("release gate rejects stale, malformed and unverifiable evidence metadata",()=>{
  const changes=[
    {sourceSha:"ffffffffffffffffffffffffffffffffffffffff"},
    {sourceSha:"short"},
    {url:"http://github.com/GoreeCloud/gc-ui/issues/85"},
    {url:"https://example.com/review"},
    {url:"https://name:password@github.com/GoreeCloud/gc-ui/issues/85"},
    {url:"not a URL"},
    {testedAt:"not-a-date"},
    {summary:"short"}
  ];
  for(const edit of changes){
    const candidate=setup();
    Object.assign(candidate.plan.gates[0].evidence[0],edit);
    assert.equal(check(candidate).ready,false,JSON.stringify(edit));
  }
});
test("source SHA and clean checkout required even if all metadata says verified",()=>{
  const candidate=setup();
  assert.equal(check(candidate,{sourceSha:null}).ready,false);
  assert.equal(check(candidate,{cleanTree:false}).ready,false);
  candidate.plan.webFoundations.status="planned";
  assert.equal(check(candidate).ready,false);
  candidate.plan.webFoundations.status="verified";
  candidate.plan.webFoundations.rootEntryStatus="stable";
  assert.equal(check(candidate).ready,false);
});
test("cannot silently promote preview exports or omit root API classification",()=>{
  const candidate=setup();
  candidate.plan.webFoundations.deferredPreviewExports=
    candidate.plan.webFoundations.deferredPreviewExports.filter(x=>x!==".");
  assert.equal(check(candidate).ready,false);
  const mixed=setup();
  mixed.plan.webFoundations.candidateStableExports.push("./commands");
  mixed.plan.webFoundations.deferredPreviewExports=
    mixed.plan.webFoundations.deferredPreviewExports.filter(x=>x!=="./commands");
  assert.equal(check(mixed).ready,false,
    "Silently promoting preview routes must not pass the frozen 1.0 contract");
  const missing=setup();
  missing.plan.webFoundations.rootSymbolClassification.candidateStable=[];
  assert.equal(check(missing).ready,false);
});
test("exact-version draft candidate remains blocked without fabricated acceptance",()=>{
  const result=evaluateReleaseReadiness(currentPlan,pkg,{sourceSha:sha,cleanTree:true});
  assert.equal(result.ready,false);
  assert.ok(result.blockers.includes("Open gate: public-api-contract"));
  assert.ok(result.blockers.some(x=>/Candidate has not been verified/.test(x)));
});

test("post-commit external decision can qualify unchanged open gate records after true acceptance",()=>{
  const candidate=setup();
  // Source gate statuses stay OPEN; post-commit decisions are outside Git.
  for(const gate of candidate.plan.gates){gate.status="open";gate.evidence=[];}
  const external={
    schemaVersion:1,packageName:"@goreecloud/ui",targetVersion:"1.0.0",
    sourceSha:sha,decision:"verified",maintainerApproval:true,
    reviewer:"GoreeCloud founder",reviewedAt:"2026-11-13T17:00:00Z",
    reviewUrl:"https://github.com/GoreeCloud/gc-ui/issues/85#issuecomment-999",
    gates:REQUIRED_RELEASE_GATES.map(id=>({id,status:"verified",evidence:[clone(goodEvidence)]}))
  };
  assert.equal(check(candidate).ready,false,"Open source gates cannot pass by default");
  assert.equal(validateExternalReleaseEvidence(external,candidate.pkg,sha),true);
  assert.equal(check(candidate,{externalEvidence:external}).ready,true,
    "Complete same-SHA post-commit metadata qualifies only with affirmative review");
  const disabled=clone(candidate);
  disabled.plan.gates[0].blocking=false;
  assert.equal(check(disabled,{externalEvidence:external}).ready,false,
    "Post-commit record may not override disabled mandatory source policy");
  for(const mutate of [
    x=>x.gates.pop(),
    x=>x.gates.push(clone(x.gates[0])),
    x=>x.sourceSha="0000000000000000000000000000000000000000",
    x=>x.reviewUrl="https://example.com/approval",
    x=>x.maintainerApproval=false,
    x=>x.gates[0].status="open",
    x=>x.gates[0].evidence[0].sourceSha="0000000000000000000000000000000000000000",
    x=>x.gates[0].evidence[0].url="http://github.com/GoreeCloud/gc-ui/issues/85"
  ]){
    const record=clone(external);mutate(record);
    assert.equal(check(candidate,{externalEvidence:record}).ready,false,JSON.stringify(record).slice(0,140));
  }
  candidate.plan.status="candidate-unverified";
  assert.equal(check(candidate,{externalEvidence:external}).ready,false,
    "External review cannot override unqualified source status");
});
