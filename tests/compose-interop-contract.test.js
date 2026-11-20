import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = file => readFileSync(new URL("../"+file,import.meta.url),"utf8");
const sample = "samples/android-compose-integration/";

test("Android sample composes both in-repo source projects without fictional Maven publication", () => {
  const settings=read(sample+"settings.gradle.kts");
  const gradle=read(sample+"app/build.gradle.kts");
  assert.match(settings,/includeBuild\("\.\.\/\.\.\/compose-multiplatform"\)/);
  assert.match(settings,/includeBuild\("\.\.\/\.\.\/android\/material3-expressive"\)/);
  assert.match(settings,/com\.goreecloud\.ui:shared-compose/);
  assert.match(settings,/com\.goreecloud\.ui:android-expressive/);
  assert.match(settings,/substitute\(module\(.+\)\)\.using\(project\(":gc-ui-compose"\)\)/);
  assert.match(gradle,/implementation\("com\.goreecloud\.ui:shared-compose:0\.0\.0"\)/);
  assert.match(gradle,/implementation\("com\.goreecloud\.ui:android-expressive:0\.0\.0"\)/);
  assert.match(gradle,/applicationId\s*=\s*"com\.goreecloud\.ui\.samples\.interop"/);
  assert.doesNotMatch(settings,/mavenLocal|https?:\/\//);
});

test("Sample Android Activity actually uses common controls under Android expressive host", () => {
  const kotlin=read(sample+"app/src/main/java/com/goreecloud/ui/samples/interop/IntegrationActivity.kt");
  assert.match(kotlin,/import com\.goreecloud\.ui\.material3\.GoreeCloudExpressiveTheme/);
  for (const use of ["GoreeCloudTokens","GoreeCloudPanel","GoreeCloudAction"]) {
    assert.match(kotlin,new RegExp("import com\\.goreecloud\\.ui\\.multiplatform\\."+use));
  }
  assert.match(kotlin,/GoreeCloudExpressiveTheme\([\s\S]+?GoreeCloudPanel\(/);
  assert.match(kotlin,/onClick\s*=\s*\{\s*tapCount\+\+\s*\}/);
  assert.doesNotMatch(kotlin,/GoreeCloudMultiplatformTheme\(/);
  assert.doesNotMatch(kotlin,/https?:\/\/|fetch\(|Retrofit|HttpClient|SharedPreferences|DataStore/);
});

test("Development fixture does not request network or privileged Android permissions", () => {
  const manifest=read(sample+"app/src/main/AndroidManifest.xml");
  assert.match(manifest,/android:allowBackup="false"/);
  assert.match(manifest,/android:usesCleartextTraffic="false"/);
  assert.doesNotMatch(manifest,/<uses-permission\b/);
  assert.match(manifest,/android:exported="true"/);
  const info=read(sample+"README.md");
  assert.match(info,/development-only/i);
  assert.match(info,/not a product release/i);
});

test("native CI checks the final merged APK permissions and debug signature", () => {
  const workflow=read(".github/workflows/compose-interop.yml");
  assert.match(workflow,/dump permissions "\$apk"/);
  assert.match(workflow,/uses-permission/);
  assert.match(workflow,/name apksigner/);
  assert.match(workflow,/verify "\$apk"/);
  assert.match(workflow,/sha256sum "\$apk"/);
  assert.match(workflow,/source-interop-compile/);
});
