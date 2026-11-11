import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const f = (name) => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("registry points to real documents and discloses unimplemented platform work", () => {
  const authority = JSON.parse(f("registry/design-authority.v1.json"));
  for (const path of Object.values(authority.implementation)) assert.ok(f(path).length > 100, path);
  assert.equal(authority.consumerMigrationStatus, "not-audited");
  assert.ok(f("docs/PLATFORM_ADAPTERS.md").includes("GoreeShield"));
  assert.ok(f("docs/PLATFORM_ADAPTERS.md").includes("Wardveil"));
  assert.ok(f("docs/PLATFORM_ADAPTERS.md").includes("GoreeCloud Mesh"));
});
test("reference lab has native landmarks and interactive controls", () => {
  const html = f("lab/index.html");
  assert.match(html, /<main/);
  assert.match(html, /<dialog/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-label=/);
  assert.match(html, /src\/tokens.css/);
  assert.match(html, /src\/components.css/);
});
test("foundations do not fetch network content or send telemetry", () => {
  for (const file of ["src/theme.js", "src/elements.js", "src/icons.js"]) {
    const code = f(file);
    assert.doesNotMatch(code, /\bfetch\s*\(/);
    assert.doesNotMatch(code, /\bnavigator\.sendBeacon\s*\(/);
  }
});
