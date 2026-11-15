/**
 * Enforce the founder's November 15, 2026 rejection of Frame Relay v1.
 *
 * Six Git blob hashes pinned to the preserved, rejected
 * GoreeCloud/brand-assets/products/gc-ui/candidates/frame-relay-v1/
 * manifest at https://github.com/GoreeCloud/brand-assets/pull/35 .
 *
 * This check prevents exact-source reuse and direct archive references
 * in the active UI. It does NOT prove originality or visual acceptance.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, lstatSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const root=fileURLToPath(new URL("../",import.meta.url));
const blocked=new Map(Object.entries({
  "6afce4ffb658c2540057e15ee229fe606822188f":"app-icon.svg",
  "842cbedd40697aa21f899b0c7948594e760714d8":"symbol.svg",
  "24423b80045875b6c66b5d253d733ab1a339317b":"favicon.svg",
  "c7057e4d7344598ddc56428d5ff6128a5815376b":"logo-light.svg",
  "434b82cb824814c7c6fe0ae717b48e90b55570b0":"logo-dark.svg",
  "0fbaab9e34385b67ae96ab8abf04eb79a7733f7d":"artwork.svg"
}));
const shaGitBlob=bytes=>createHash("sha1")
  .update("blob "+bytes.length+"\0").update(bytes).digest("hex");
const walk=(dir,out=[])=>{
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    const file=join(dir,entry.name);
    const info=lstatSync(file);
    assert.ok(!info.isSymbolicLink(),"Unreviewed symlink in UI assets/source: "+relative(root,file));
    if(info.isDirectory())walk(file,out);
    else if(info.isFile())out.push(file);
  }
  return out;
};
test("Frame Relay's six source fingerprints remain rejected, never a valid official asset",()=>{
  assert.equal(blocked.size,6);
  for(const [sha,name] of blocked){
    assert.match(sha,/^[a-f0-9]{40}$/);
    assert.match(name,/\.svg$/);
  }
  const doc=readFileSync(join(root,"docs/OFFICIAL_IDENTITY.md"),"utf8");
  assert.match(doc,/Frame Relay v1/);
  assert.match(doc,/rejected/i);
  assert.match(doc,/founder-rejected-archived/);
  assert.match(doc,/a \*\*different\*\* GoreeCloud UI design/);
});

test("active source assets cannot contain exact bytes of a founder-rejected mark",()=>{
  const all=walk(join(root,"assets"));
  const graphic=/\.(?:svg|png|ico|webp|jpe?g|gif|avif)$/i;
  const images=all.filter(path=>graphic.test(path));
  assert.ok(images.length>=6,"No official/functional graphical assets were scanned");
  for(const path of images){
    const sha=shaGitBlob(readFileSync(path));
    assert.ok(!blocked.has(sha),
      relative(root,path)+" copies rejected Frame Relay "+blocked.get(sha));
  }
});

test("working Lab and shared runtime must not directly load the rejected archive",()=>{
  const executable=/\.(?:html|js|mjs|css)$/i;
  let reviewed=0;
  for(const folder of ["lab","src"]){
    for(const path of walk(join(root,folder)).filter(path=>executable.test(path))){
      const source=readFileSync(path,"utf8");
      assert.doesNotMatch(source,/frame-relay-v1|products\/gc-ui\/candidates\/frame-relay/i,
        relative(root,path)+" links to founder-rejected design");
      reviewed++;
    }
  }
  assert.ok(reviewed>=5,"Runtime and Lab source were not scanned");
  const pkg=JSON.parse(readFileSync(join(root,"package.json"),"utf8"));
  assert.ok(!JSON.stringify(pkg.exports).includes("frame-relay"));
  assert.ok(!pkg.files.some(path=>path.includes("assets/identity")),
    "Graphic identity must not silently enter the open-source foundation package");
});
