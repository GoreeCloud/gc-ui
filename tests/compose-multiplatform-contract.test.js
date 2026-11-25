import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";

const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL(path,root),"utf8");
const android = "android/material3-expressive/gc-ui-compose/src/main/java/com/goreecloud/ui/material3/";
const common = "compose-multiplatform/gc-ui-compose/src/commonMain/kotlin/com/goreecloud/ui/multiplatform/";

test("one canonical token manifest generates both Compose palette sources", () => {
  assert.doesNotThrow(() => execFileSync(process.execPath,
    ["scripts/generate-compose-tokens.mjs","--check"],{cwd:root,stdio:"pipe"}));
  const source = read("tokens/gc.tokens.json");
  const m = JSON.parse(source);
  const a = read(android+"GeneratedGoreePalettes.kt");
  const b = read(common+"GeneratedGoreePalettes.kt");
  assert.equal(a.replace("package com.goreecloud.ui.material3","package SHARED"),
    b.replace("package com.goreecloud.ui.multiplatform","package SHARED"));
  for(const accent of Object.keys(m.accents)) for(const mode of ["light","dark"])
    assert.ok(b.includes('"'+accent+'/'+mode+'"'));
});

test("shared Compose Kotlin stack and boundaries are explicit", () => {
  const rootBuild=read("compose-multiplatform/build.gradle.kts");
  const moduleBuild=read("compose-multiplatform/gc-ui-compose/build.gradle.kts");
  const theme=read(common+"GoreeCloudUi.kt");
  const docs=read("docs/COMPOSE_MULTIPLATFORM.md");
  assert.match(rootBuild,/org\.jetbrains\.compose.*1\.12\.2/);
  assert.match(rootBuild,/org\.jetbrains\.kotlin\.plugin\.compose.*2\.4\.21/);
  assert.match(moduleBuild,/com\.android\.kotlin\.multiplatform\.library/);
  assert.match(moduleBuild,/iosArm64\(\)/);
  assert.match(moduleBuild,/iosSimulatorArm64\(\)/);
  assert.doesNotMatch(moduleBuild,/iosX64\(\)/);
  assert.match(moduleBuild,/implementation\(compose\.material3\)/);
  assert.match(theme,/fun GoreeCloudMultiplatformTheme\(/);
  assert.match(theme,/fun GoreeCloudNavigation\(/);
  assert.match(theme,/windowInsets\s*=\s*WindowInsets\(0, 0, 0, 0\)/,
    "portable navigation must consume system inset only once");
  assert.match(theme,/surfaceContainerLowest\s*=\s*color\("surface"\)/);
  assert.match(theme,/surfaceContainerHighest\s*=\s*color\("surface-tonal"\)/);
  for (const role of ["onPositive", "onWarning", "onNegative", "lensFill", "brandContainer", "outlineSoft", "scrim"])
    assert.ok(theme.includes("val " + role + ": Color"), "missing semantic role " + role);
  const androidTheme = read(android+"GoreeCloudExpressiveTheme.kt");
  assert.match(androidTheme,/surfaceContainer\s*=\s*c\("surface-tonal"\)/);

  assert.match(docs,/Material 3 Expressive/);
  assert.match(docs,/Qt Quick/);
  assert.match(read(android+"GoreeCloudExpressiveTheme.kt"),/MotionScheme\.expressive\(\)/);
});
