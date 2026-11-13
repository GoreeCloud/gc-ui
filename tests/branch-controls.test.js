import {test} from "node:test";
import assert from "node:assert/strict";
import {assessBranchProtection,REQUIRED_UI_CHECKS} from "../scripts/audit-branch-controls.mjs";

const protectedBranch={name:"main",protected:true};
const classic=()=>({
 required_status_checks:{strict:true,checks:REQUIRED_UI_CHECKS.map(context=>({context}))},
 required_pull_request_reviews:{required_approving_review_count:0},
 allow_force_pushes:{enabled:false},allow_deletions:{enabled:false},
 enforce_admins:{enabled:true}
});
test("observed protection is only a prerequisite to an owner negative-merge test",()=>{
 const status=assessBranchProtection({branch:protectedBranch,classic:classic(),rules:[]});
 assert.equal(status.readyForOwnerNegativeTest,true,status.blockers.join("\n"));
 assert.equal(status.status,"configuration-observed-owner-negative-test-required");
 assert.equal(status.approvalForStableRelease,false);
 assert.equal(REQUIRED_UI_CHECKS.length,5);
});
test("actual currently unprotected state is rejected even with successful CI runs",()=>{
 const summary=assessBranchProtection({branch:{name:"main",protected:false,
  protection:{required_status_checks:{enforcement_level:"off",checks:[],contexts:[]}}},
  classic:null,rules:[]});
 assert.equal(summary.readyForOwnerNegativeTest,false);
 assert.ok(summary.blockers.some(x=>/not confirmed protected/.test(x)));
 assert.equal(summary.approvalForStableRelease,false);
});
test("each missing required check or policy guard fails closed",()=>{
 const cases=[
  c=>c.required_status_checks.checks.pop(),
  c=>{c.required_status_checks.strict=false},
  c=>{c.required_pull_request_reviews=null},
  c=>{c.allow_force_pushes.enabled=true},
  c=>{c.allow_deletions.enabled=true},
  c=>{c.enforce_admins.enabled=false}
 ];
 for(const breakIt of cases){
  const c=classic();breakIt(c);
  const result=assessBranchProtection({branch:protectedBranch,classic:c,rules:[]});
  assert.equal(result.readyForOwnerNegativeTest,false,result.blockers.join("\n"));
 }
 const missingAdmin=assessBranchProtection({branch:protectedBranch,rules:[
  {type:"pull_request"},{type:"non_fast_forward"},{type:"deletion"},
  {type:"required_status_checks",parameters:{
    strict_required_status_checks_policy:true,
    required_status_checks:REQUIRED_UI_CHECKS.map(context=>({context}))
  }}
 ]});
 assert.equal(missingAdmin.readyForOwnerNegativeTest,false,
   "Rules with unknown bypass permission cannot certify admin enforcement");
});
test("GitHub API 403 and incomplete responses never imply release authorization",()=>{
 const good=assessBranchProtection({branch:protectedBranch,classic:classic(),rules:[],
  errors:["classic read GET branches/main/protection returned HTTP 403"]});
 assert.equal(good.readyForOwnerNegativeTest,false);
 assert.ok(good.blockers.some(x=>/403/.test(x)));
 assert.equal(assessBranchProtection({branch:protectedBranch}).readyForOwnerNegativeTest,false);
});
