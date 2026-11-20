import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Compose tokens match authoritative GC UI manifest", () => {
  assert.doesNotThrow(() => execFileSync(process.execPath,
    ["scripts/generate-compose-tokens.mjs","--check"],
    {cwd:new URL("../",import.meta.url),stdio:"pipe"}));
  const kt=read("android/material3-expressive/gc-ui-compose/src/main/java/com/goreecloud/ui/material3/GeneratedGoreePalettes.kt");
  for(const accent of ["iris","lagoon","ember","moss"])
    for(const mode of ["light","dark"])assert.ok(kt.includes('"'+accent+'/'+mode+'"'));
});
test("Expressive motion, privacy-friendly dynamic-color default and floating navigation", () => {
  const base="android/material3-expressive/gc-ui-compose/";
  const theme=read(base+"src/main/java/com/goreecloud/ui/material3/GoreeCloudExpressiveTheme.kt");
  const nav=read(base+"src/main/java/com/goreecloud/ui/material3/GoreeFloatingNavigationBar.kt");
  assert.match(read(base+"build.gradle.kts"),/androidx\.compose\.material3:material3:1\.5\.0/);
  assert.match(theme,/MotionScheme\.expressive\(\)/);
  assert.match(theme,/dynamicWallpaperColors: Boolean = false/);
  assert.match(theme,/GeneratedGoreePalettes\.palettes/);
  assert.match(nav,/navigationBarsPadding\(\)/);
  assert.match(nav,/destinations\.size in 3\.\.5/);
});

test("Android floating navigation enforces labeled, coherent destinations and avoids repeat navigation", () => {
  const nav=read("android/material3-expressive/gc-ui-compose/src/main/java/com/goreecloud/ui/material3/GoreeFloatingNavigationBar.kt");
  assert.match(nav,/destinations\.all\s*\{\s*it\.id\.isNotBlank\(\)\s*&&\s*it\.label\.isNotBlank\(\)/);
  assert.match(nav,/destinations\.map\s*\{\s*it\.id\s*\}\.distinct\(\)\.size\s*==\s*destinations\.size/);
  assert.match(nav,/destinations\.any\s*\{\s*it\.id\s*==\s*selectedId\s*\}/);
  assert.match(nav,/if\s*\(destination\.id\s*!=\s*selectedId\)\s*onDestinationSelected\(destination\.id\)/);
  assert.match(nav,/alwaysShowLabel\s*=\s*true/);
  assert.match(nav,/navigationBarsPadding\(\)/);
});
