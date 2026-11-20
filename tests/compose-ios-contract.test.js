import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("common Kotlin UI exposes only supported Apple Silicon iOS targets", () => {
  const gradle=read("compose-multiplatform/gc-ui-compose/build.gradle.kts");
  assert.match(gradle,/iosArm64\(\)/);
  assert.match(gradle,/iosSimulatorArm64\(\)/);
  assert.doesNotMatch(gradle,/iosX64\(\)/);
  const source=read("compose-multiplatform/gc-ui-compose/src/commonMain/kotlin/com/goreecloud/ui/multiplatform/GoreeCloudUi.kt");
  assert.match(source,/fun GoreeCloudMultiplatformTheme\(/);
  assert.match(source,/fun GoreeCloudNavigation\(/);
});

test("macOS CI compiles real iOS Simulator source without release or signing", () => {
  const ci=read(".github/workflows/compose-ios.yml");
  assert.match(ci,/runs-on: macos-15/);
  assert.match(ci,/test "\$\(uname -m\)" = "arm64"/);
  assert.match(ci,/compileKotlinIosSimulatorArm64/);
  assert.match(ci,/gradle-version: "9\.4\.1"/);
  assert.match(ci,/android-37\.1/);
  assert.match(ci,/xcrun --sdk iphonesimulator/);
  assert.match(ci,/permissions:\s*\n\s*contents: read/);
  assert.doesNotMatch(ci,/upload-artifact|publish|assembleRelease|codesign|signingIdentity/);
});
