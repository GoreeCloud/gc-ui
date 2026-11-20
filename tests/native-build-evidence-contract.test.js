import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");

test("published README distinguishes native source compilation from app adoption", () => {
  const readme=read("README.md");
  for (const dependency of [
    "android/material3-expressive/README.md",
    "compose-multiplatform/README.md",
    "samples/android-compose-integration/README.md"
  ]) {
    assert.ok(existsSync(new URL(dependency,root)),dependency+" must exist");
    assert.ok(readme.includes("]("+dependency+")"),dependency+" must be linked");
  }
  assert.match(readme,/Android Compose\/Expressive sources compiled together/);
  assert.match(readme,/iOS Simulator ARM64 Kotlin source compiled/);
  assert.match(readme,/not.*published Android SDK/i);
  assert.match(readme,/not.*published SDK/i);
  assert.match(readme,/not.*device runtime/i);
  assert.match(readme,/not.*migration of any consumer/i);
  assert.doesNotMatch(readme,/does \*\*not\*\* establish[^.]*Gradle build success/);
});
