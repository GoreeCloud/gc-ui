import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const scope=read("registry/web-acceptance-scope.v1.json");
const plan=read("registry/release-plan.v1.json");
const authority=read("registry/design-authority.v1.json");
test("Stable 1.0 browser support is narrow and distinguishes viewport emulation from physical devices",()=>{
  assert.equal(scope.schemaVersion,1);
  assert.equal(scope.releaseTarget,plan.targetStableVersion);
  assert.equal(scope.supportedConfiguration.browserEngine,"Chromium");
  assert.equal(scope.supportedConfiguration.headless,true);
  assert.match(scope.supportedConfiguration.platform,/Ubuntu 24\.04/);
  assert.deepEqual(scope.verifiedAutomatedMatrix.layoutCssWidths,[320,390,600,900,1440]);
  assert.equal(scope.verifiedAutomatedMatrix.independentAppScopes,true);
  assert.ok(scope.provisionallyUnsupportedOrUnverified.some(x=>/Firefox/.test(x.name)));
  assert.ok(scope.provisionallyUnsupportedOrUnverified.some(x=>/Safari/.test(x.name)));
  assert.ok(scope.provisionallyUnsupportedOrUnverified.every(x=>x.status==="not-tested" && x.releaseClaim===false));
  assert.ok(scope.verifiedAutomatedMatrix.limitations.some(x=>/NOT actual browser zoom/.test(x)));
  assert.equal(scope.acceptancePolicy.mandatoryGlobalHue,false);
  assert.equal(scope.acceptancePolicy.mandatoryAppearanceTheme,false);
  assert.equal(authority.colorPolicy.mandatoryGlobalHue,false);
  assert.equal(authority.colorPolicy.mandatoryAppearanceTheme,false);
});
test("baseline visual review has source-linked evidence and does not fraudulently close Stable gates",()=>{
  const review=scope.visualEvidence;
  assert.equal(review.status,"AI-reviewed-selected-baseline-views-not-candidate-acceptance");
  assert.equal(review.baselineSourceSha,"c235f9b5e2577c440465de0d455372c363f4d01d");
  assert.match(review.artifactDigestSha256,/^[a-f0-9]{64}$/);
  assert.equal(review.pngCount,53);
  assert.deepEqual(review.reviewed.map(x=>x.file),[
    "gc-ui-light-desktop.png","gc-ui-dark-mobile.png","gc-ui-light-mobile-320.png"]);
  assert.equal(review.reviewerType,"AI-assisted visual inspection");
  assert.equal(scope.acceptancePolicy.candidateReviewStatus,"pending-exact-1.0.0-commit-and-artifact");
  assert.equal(plan.gates.find(x=>x.id==="real-web-acceptance").status,"open");
});
