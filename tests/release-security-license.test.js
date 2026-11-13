import { test } from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const audit=JSON.parse(load("registry/release-security-audit.v1.json"));
const pkg=JSON.parse(load("package.json"));
const plan=JSON.parse(load("registry/release-plan.v1.json"));
test("release source/license review states exact baseline, dependencies and unresolved legal gate",()=>{
 assert.equal(audit.schemaVersion,1);
 assert.equal(audit.sourceSha,"c235f9b5e2577c440465de0d455372c363f4d01d");
 assert.equal(audit.sourceInventory.clientJsModules,readdirSync(new URL("../src/",import.meta.url)).filter(n=>n.endsWith(".js")).length);
 assert.equal(audit.sourceInventory.clientCssFiles,3);
 assert.equal(audit.licenseInventory.packageSpdx,pkg.license);
 assert.match(load("LICENSE"),/MIT License/);
 assert.equal(pkg.dependencies,undefined);
 assert.equal(pkg.devDependencies,undefined);
 assert.equal(audit.licenseInventory.identityAssets.count,6);
 assert.equal(audit.licenseInventory.identityAssets.masterLicenseFile,"not-present");
 assert.equal(audit.candidateGate,"open");
 assert.equal(audit.signedOrPublished,false);
 assert.equal(plan.gates.find(x=>x.id==="source-security-privacy").status,"open");
});
test("new high-confidence unsafe-code signatures remain CI-enforced",()=>{
 const guard=load("scripts/audit-client-boundary.mjs");
 for(const k of ["dynamic-code-eval","dynamic-code-constructor","dynamic-document-write","dynamic-string-timer"])assert.ok(guard.includes(k),k);
});
