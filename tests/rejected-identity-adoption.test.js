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

// The three original vector paths are pinned directly from the rejected
// brand-assets source blob 842cbedd40697aa21f899b0c7948594e760714d8. Recoloring or reshuffling paths
// is not an acceptable way to revive the rejected symbol.
const rejectedCorePathData=Object.freeze([
  "M71 28h105c20 0 36 16 36 36v28h-30V66c0-5-4-9-9-9H73c-5 0-9 4-9 9v116c0 5 4 9 9 9h37v30H71c-20 0-37-16-37-37V65c0-20 17-37 37-37Z",
  "M139 80h40c23 0 41 18 41 41v63c0 23-18 41-41 41h-40v-30h40c6 0 11-5 11-11v-63c0-6-5-11-11-11h-40V80Z",
  "M111 111h44c12 0 21 9 21 21v36c0 12-9 21-21 21h-44c-12 0-21-9-21-21v-36c0-12 9-21 21-21Zm8 27v24h28v-24h-28Z"
]);
const pathToken=/[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
const canonicalPath=value=>{
 if(typeof value!=="string"||value.length>20000)return null;
 const tokens=value.match(pathToken);
 if(!tokens || tokens.length<4)return null;
 if(value.replace(pathToken,"").replace(/[\s,]/g,""))return null;
 return tokens.join("|");
};
const pathsFromSvg=svg=>{
 const paths=new Set();
 for(const tag of svg.matchAll(/<path\b[^>]*>/gi)){
  const d=tag[0].match(/\bd\s*=\s*(["'])([\s\S]*?)\1/i);
  if(d){const canonical=canonicalPath(d[2]);if(canonical)paths.add(canonical);}
 }
 return paths;
};
const originalGeometry=new Set(rejectedCorePathData.map(canonicalPath));
const isRejectedFrameGeometry=svg=>{
 const actual=pathsFromSvg(svg);
 return [...originalGeometry].every(x=>actual.has(x));
};
test("recolored or reordered rejected mark remains blocked, not just identical bytes",()=>{
 assert.equal(originalGeometry.size,3);
 const redraw=(colors=["#111111","#222222","#333333"],order=[0,1,2])=>
  "<svg xmlns='http://www.w3.org/2000/svg'>"+
  order.map(i=>"<path fill='"+colors[i]+"' d='"+rejectedCorePathData[i]+"'/>").join("")+
  "</svg>";
 assert.ok(isRejectedFrameGeometry(redraw()));
 assert.ok(isRejectedFrameGeometry(redraw(["#121212","#343434","#565656"],[2,0,1])));
 assert.ok(isRejectedFrameGeometry(redraw().replace("M71 28h105","M71,28 h105")));
 assert.equal(isRejectedFrameGeometry(redraw().replace("M71 28h105","M71 29h105")),false,
  "Modified geometry must not be misrepresented as automatically recognized");
});
test("active UI SVGs must not contain the rejected mark's three original paths",()=>{
 const files=walk(join(root,"assets")).filter(x=>x.toLowerCase().endsWith(".svg"));
 assert.ok(files.length>3);
 for(const file of files){
  assert.equal(isRejectedFrameGeometry(readFileSync(file,"utf8")),false,
   relative(root,file)+" contains the founder-rejected frame symbol despite cosmetic source changes");
 }
});
