import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("registry/design-authority.v1.json", root), "utf8"));
const docs = readFileSync(new URL("docs/COMPOSE_MULTIPLATFORM.md", root), "utf8");
const androidDocs = readFileSync(new URL("docs/ANDROID_MATERIAL3_EXPRESSIVE.md", root), "utf8");

test("targeted Android Kotlin adoption evidence is exact and does not claim native release", () => {
  const evidence = manifest.androidDesignFoundation.partialConsumerEvidence;
  const records = evidence.verifiedComposeConsumers;
  assert.equal(new Set(records.map(r => r.repository.toLowerCase())).size, records.length);
  const expected = [
    ["GoreeCloud/DNS", "https://github.com/GoreeCloud/DNS/pull/28", "b80ce4b48feff9697819754a4efe00cf65a49c6e"],
    ["GoreeCloud/AI", "https://github.com/GoreeCloud/AI/pull/35", "74bbd9ccff4a31795df41317c73365f2ce538e11"],
  ];
  for (const [repo, pr, commit] of expected) {
    const record = records.find(r => r.repository === repo);
    assert.ok(record, "Missing verified source integration for " + repo);
    assert.equal(record.pullRequest, pr);
    assert.equal(record.mergeCommit, commit);
    assert.ok(docs.includes(pr));
    assert.ok(androidDocs.includes(pr));
  }
  assert.equal(evidence.scope, "targeted-consumers-only-not-ecosystem-wide-audit");
  assert.equal(manifest.androidDesignFoundation.deviceAcceptance, "not-verified");
  assert.ok(evidence.acceptanceNotVerified.includes("physical-device"));
  assert.notEqual(manifest.androidDesignFoundation.downstreamAdoption, "completed");
});
