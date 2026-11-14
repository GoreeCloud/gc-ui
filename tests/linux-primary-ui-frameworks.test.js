import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const policy = JSON.parse(read("registry/linux-primary-ui-frameworks.v1.json"));
const authority = JSON.parse(read("registry/design-authority.v1.json"));

test("founder Linux UI restriction applies to existing and future graphical apps", () => {
  assert.equal(policy.schemaVersion, 1);
  assert.equal(policy.scope, "all-existing-and-future-linux-graphical-applications");
  assert.equal(policy.grandfathering, false);
  assert.deepEqual(policy.approvedPrimaryFrameworks.map((f) => f.id), [
    "qt-quick", "flutter-linux-desktop", "slint"
  ]);
  assert.equal(policy.approvedPrimaryFrameworks[0].requiredQtVersion, "6.12.0");
  assert.equal(policy.approvedPrimaryFrameworks[1].requiredSdkVersion, null);
  assert.equal(policy.approvedPrimaryFrameworks[2].requiredSdkVersion, null);
});

test("nonconforming Linux UI must never be reported as compliant", () => {
  const allowed = new Set(policy.approvedPrimaryFrameworks.map((f) => f.id));
  assert.equal(policy.consumerSnapshots.length, 8);
  for (const consumer of policy.consumerSnapshots) {
    assert.ok(!allowed.has(consumer.primaryUi), consumer.repo);
    assert.equal(consumer.status, "migration-required", consumer.repo);
    assert.ok(consumer.evidencePath);
    if (consumer.repo === "GoreeCloud/app-store") {
      assert.equal(consumer.launchEvidencePath, "linux/run.sh");
    }
    assert.ok(consumer.versionEvidencePath || consumer.migrationIssue, consumer.repo);
  }
  assert.deepEqual(policy.consumerSnapshots.map((x) => x.repo), [
    "GoreeCloud/browser", "GoreeCloud/index",
    "GoreeCloud/contacts", "GoreeCloud/app-store",
    "GoreeCloud/tasks", "GoreeCloud/memos",
    "GoreeCloud/documents", "GoreeCloud/rich-text-editor"
  ]);
  assert.ok(policy.disallowedPrimaryExamples.includes("qt-widgets"));
  assert.ok(policy.disallowedPrimaryExamples.includes("gtk4-libadwaita"));
  assert.ok(policy.disallowedPrimaryExamples.includes("gtk4"));
  assert.ok(policy.disallowedPrimaryExamples.includes("gpui"));
});

test("Linux policy is mirrored in the native adapter contract, not a new native SDK", () => {
  assert.equal(authority.linuxPrimaryUiFrameworks.policy, "registry/linux-primary-ui-frameworks.v1.json");
  assert.equal(policy.nativeSdkStatus, "not-implemented");
  assert.equal(authority.nativeSdkStatus, "not-implemented");
  assert.equal(policy.masterDriveReconciliation, "verified-targeted");
  assert.equal(authority.linuxPrimaryUiFrameworks.masterDriveReconciliation, "verified-targeted");
  assert.equal(policy.masterDriveGovernanceSection, "14.2B");
  assert.equal(authority.linuxPrimaryUiFrameworks.masterGovernanceSection, "14.2B");
  const docs = read(policy.docs);
  const native = read("docs/PLATFORM_ADAPTERS.md");
  assert.match(docs, /no grandfathering|no grandfathering/i);
  assert.match(docs, /Qt Quick.*6\.12\.0/);
  assert.match(docs, /migration required/i);
  assert.match(native, /Qt Quick \(Qt 6\.12\.0\), Flutter Linux Desktop or Slint only/);
});

test("optional Qt Quick previews must never override legacy primary UI noncompliance", () => {
  assert.equal(policy.previewStatusNotCompliance, true);
  const candidates = new Map(
    policy.consumerSnapshots.filter((row) => row.previewCandidate).map((row) => [row.repo, row])
  );
  assert.deepEqual([...candidates.keys()], [
    "GoreeCloud/index", "GoreeCloud/contacts", "GoreeCloud/app-store", "GoreeCloud/memos"
  ]);
  for (const [name, row] of candidates) {
    const preview = row.previewCandidate;
    assert.equal(row.status, "migration-required", name);
    assert.equal(preview.framework, "qt-quick", name);
    assert.equal(preview.qtVersion, "6.12.0", name);
    assert.equal(preview.defaultPrimaryUiReplaced, false, name);
    assert.equal(preview.userDeviceAcceptance, false, name);
    assert.ok(preview.sourcePath, name);
  }
  const index = candidates.get("GoreeCloud/index").previewCandidate;
  assert.equal(index.implementation, "merged-optional");
  assert.equal(index.verifiedPRs.length, 7);
  assert.ok(index.verifiedPRs.includes("https://github.com/GoreeCloud/index/pull/52"));
  assert.equal(index.featureParityVerified, false);
  assert.equal(index.qmlSourcePath, "src/goreecloud_index/qtquick/Main.qml");
  assert.equal(index.migrationIssue, "https://github.com/GoreeCloud/index/issues/43");
  const store = candidates.get("GoreeCloud/app-store").previewCandidate;
  assert.equal(store.implementation, "merged-optional");
  assert.equal(store.hostedQt612SmokesPassed, true);
  assert.equal(store.verifiedPRs.length, 6);
  assert.ok(store.verifiedPRs.includes("https://github.com/GoreeCloud/app-store/pull/11"));
  assert.ok(store.verifiedPRs.includes("https://github.com/GoreeCloud/app-store/pull/12"));
  assert.equal(store.supersededClosedPR, "https://github.com/GoreeCloud/app-store/pull/10");
  assert.equal(store.lastVerifiedMergedCommit, "8ba7f2ff72074cfe659d7c4540692b8c7807021b");
  assert.equal(store.featureParityVerified, false);
  assert.equal(policy.consumerSnapshotLastVerifiedDate, "2026-11-14");
  for (const repo of ["GoreeCloud/contacts", "GoreeCloud/memos"]) {
    assert.equal(candidates.get(repo).previewCandidate.implementation, "open-draft");
  }
  const docs = read(policy.docs);
  assert.match(docs, /Optional Qt Quick migration candidates/);
  assert.match(docs, /not approved primary app migrations/i);
});
