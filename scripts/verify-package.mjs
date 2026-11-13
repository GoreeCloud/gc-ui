#!/usr/bin/env node
/**
 * Verify the packed @goreecloud/ui tarball in an isolated offline consumer.
 * This uses no registry requests, third-party dependencies or global installs.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=fileURLToPath(new URL("../",import.meta.url));
const temp=mkdtempSync(join(tmpdir(),"gc-ui-consumer-"));
const npm=process.platform==="win32"?"npm.cmd":"npm";
const run=(cmd,args,cwd)=>execFileSync(cmd,args,{
  cwd,encoding:"utf8",timeout:60000,maxBuffer:8*1024*1024,
  env:{...process.env,npm_config_audit:"false",npm_config_fund:"false"}
});
try{
  // Run local prepack checks separately: their stdout must not corrupt npm pack JSON.
  run(npm,["run","prepack","--offline"],root);
  const packed=JSON.parse(run(npm,["pack","--json","--ignore-scripts","--offline","--pack-destination",temp],root));
  if(packed.length!==1||packed[0].name!=="@goreecloud/ui")throw new Error("Unexpected npm package");
  const meta=packed[0],files=new Set(meta.files.map(file=>file.path));
  const required=[
    "src/index.js","src/index.d.ts","src/components.css","src/tokens.css","src/glass.css",
    "src/menu.js","src/menu.d.ts","src/table.js","src/table.d.ts",
    "src/commands.js","src/commands.d.ts","src/tree.js","src/tree.d.ts","src/combobox.js","src/combobox.d.ts",
    "src/bottom-nav.js","src/bottom-nav.d.ts",
    "tokens/gc.tokens.json",
    "assets/gc-icons.svg","assets/gc-icons.json",
    "platform/generated/GCUI.palettes.json","LICENSE"
  ];
  for(const path of required)if(!files.has(path))throw new Error("Missing package asset: "+path);
  const consumer=join(temp,"consumer");
  mkdirSync(consumer,{recursive:true});
  run(npm,["install","--offline","--ignore-scripts","--no-audit","--no-fund",
    "--package-lock=false","--prefix",consumer,join(temp,meta.filename)],consumer);
  writeFileSync(join(consumer,"verify.mjs"),"import assert from \"node:assert/strict\";\nimport {readFileSync} from \"node:fs\";\nimport {fileURLToPath} from \"node:url\";\nimport * as ui from \"@goreecloud/ui\";\nimport {initActionMenu} from \"@goreecloud/ui/menu\";\nimport {initSortableTable} from \"@goreecloud/ui/table\";\nimport {initCommandPalette} from \"@goreecloud/ui/commands\";\nimport {ICON_NAMES} from \"@goreecloud/ui/icons\";\nimport {applyTheme} from \"@goreecloud/ui/theme\";\nimport {initAccordion} from \"@goreecloud/ui/patterns\";\nfor(const fn of [initActionMenu,initSortableTable,initCommandPalette,applyTheme,initAccordion]) assert.equal(typeof fn,\"function\");\nassert.equal(ui.initSortableTable,initSortableTable);\nassert.equal(ui.initActionMenu,initActionMenu);\nassert.ok(ICON_NAMES.length>=35);\nconst content=specifier=>readFileSync(fileURLToPath(import.meta.resolve(specifier)),\"utf8\");\nassert.match(content(\"@goreecloud/ui/tokens.css\"),/--gc-brand:/);\nassert.match(content(\"@goreecloud/ui/components.css\"),/gc-sort-button/);\nassert.match(content(\"@goreecloud/ui/glass.css\"),/gc-glass-overlay/);\nassert.match(content(\"@goreecloud/ui/icon-sprite\"),/gc-icon-search/);\nconst registry=JSON.parse(content(\"@goreecloud/ui/icon-registry\"));\nassert.equal(registry.count,ICON_NAMES.length);\nconst manifest=JSON.parse(content(\"@goreecloud/ui/tokens\"));\nassert.deepEqual(manifest.meta.materials,[\"Cloud Canvas\",\"Cloud Surface\",\"Cloud Lens\"]);\nconsole.log(\"Offline installed package exports and assets passed\");\n","utf8");
  console.log(run(process.execPath,["verify.mjs"],consumer).trim());
  console.log("Verified "+files.size+" packaged files in an offline isolated consumer");
}finally{
  rmSync(temp,{recursive:true,force:true});
}
