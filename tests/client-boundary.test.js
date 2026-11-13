import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { scanClientSource, scanStylesheet } from "../scripts/audit-client-boundary.mjs";
const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("all published source modules avoid implicit network, storage or unsafe HTML writes",()=>{
  const files=readdirSync(new URL("../src/",import.meta.url)).filter(x=>x.endsWith(".js"));
  assert.ok(files.length>=14);
  for(const filename of files){
    const findings=scanClientSource("src/"+filename,read("src/"+filename));
    assert.deepEqual(findings,[],"Unexpected client-side behavior in "+filename);
  }
});
test("published CSS roles contain no off-origin import or image URL",()=>{
  for(const name of ["tokens.css","components.css","glass.css"]){
    assert.deepEqual(scanStylesheet("src/"+name,read("src/"+name)),[]);
  }
});
test("static boundary detects network, storage, remote stylesheet, and HTML injection drift",()=>{
  const risky=[
    ["eval('alert(1)')","dynamic-code-eval"],
    ["new Function('return secret')","dynamic-code-constructor"],
    ["document.write(userData)","dynamic-document-write"],
    ["setTimeout('alert(1)',10)","dynamic-string-timer"]
  ];
  for(const [src,kind] of risky)assert.ok(
    scanClientSource("src/new.js",src).some(x=>x.category===kind),src);
  const examples=[
    ["fetch('https://remote.test')","network-fetch"],
    ["window.fetch('/private')","network-fetch"],
    ["new WebSocket('wss://x')","network-socket"],
    ["localStorage.setItem('token','abc')","persistent-localstorage"],
    ["indexedDB.open('x')","persistent-indexeddb"],
    ["document.cookie='bad'","persistent-cookie"],
    ["navigator.serviceWorker.register('/worker.js')","persistent-serviceworker"],
    ["node.innerHTML = query","unsafe-dom-write"],
    ["import('https://example.test/mod.js')","remote-dynamic-import"]
  ];
  for(const [src,kind] of examples)assert.ok(
    scanClientSource("src/new.js",src).some(x=>x.category===kind),src
  );
  assert.ok(scanStylesheet("src/foo.css","@import url('https://example.test/foo.css')").length>0);
  assert.ok(scanStylesheet("src/bar.css","div{background:url(https://evil.test/x.jpg)}").length>0);
  assert.deepEqual(scanClientSource("src/elements.js",
    "this.shadowRoot.innerHTML = iconSvg(name, { size, decorative: true });"),[]);
  assert.ok(scanClientSource("src/elements.js",
    "someElement.innerHTML = userInput").length>0);
});
