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
  assert.equal(policy.consumerSnapshots.length, 6);
  for (const consumer of policy.consumerSnapshots) {
    assert.ok(!allowed.has(consumer.primaryUi), consumer.repo);
    assert.equal(consumer.status, "migration-required", consumer.repo);
    assert.ok(consumer.evidencePath);
    if (consumer.repo === "GoreeCloud/app-store") {
      assert.equal(consumer.launchEvidencePath, "linux/run.sh");
    } else if (consumer.repo === "GoreeCloud/tasks" || consumer.repo === "GoreeCloud/memos") {
      assert.ok(consumer.migrationIssue);
    } else {
      assert.ok(consumer.versionEvidencePath);
    }
  }
  assert.deepEqual(policy.consumerSnapshots.map((x) => x.repo), [
    "GoreeCloud/browser", "GoreeCloud/index",
    "GoreeCloud/contacts", "GoreeCloud/app-store",
    "GoreeCloud/tasks", "GoreeCloud/memos"
  ]);
  assert.ok(policy.disallowedPrimaryExamples.includes("qt-widgets"));
  assert.ok(policy.disallowedPrimaryExamples.includes("gtk4-libadwaita"));
  assert.ok(policy.disallowedPrimaryExamples.includes("gtk4"));
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
