import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const path = new URL("../registry/acceptance-matrix.v1.json", import.meta.url);
const data = JSON.parse(readFileSync(path,"utf8"));
const states = new Set(["pass","fail","inconclusive","not-tested","not-applicable"]);
const required = new Set(["theme","tabs","accordion","toggle-group","drawer","command-palette","action-menu","sortable-table","treeview","combobox","bottom-navigation","toast","responsive-shell"]);

test("manual and physical-device acceptance matrix has explicit scope and full component inventory", () => {
  assert.equal(data.schemaVersion,1);
  assert.match(data.scope,/web reference lab/i);
  const found = new Set(data.entries.map(x=>x.surface));
  for (const name of required) assert.ok(found.has(name),"missing manual scenario for "+name);
  assert.ok(data.entries.some(x=>x.platform.includes("Android")));
  assert.ok(data.entries.some(x=>x.platform.includes("iOS")));
  assert.ok(data.entries.some(x=>x.platform.includes("Windows")));
  assert.ok(data.entries.some(x=>x.platform.includes("Linux")));
  assert.ok(data.entries.some(x=>x.platform.includes("macOS")));
});

test("human acceptance cannot pass on a bare checklist without reproducible evidence", () => {
  const seen = new Set();
  for (const entry of data.entries) {
    assert.equal(typeof entry.id,"string"); assert.ok(!seen.has(entry.id)); seen.add(entry.id);
    for (const key of ["surface","platform","modality","steps","expected"]) {
      assert.ok(typeof entry[key]==="string" && entry[key].trim().length>(key==="surface"?2:8),entry.id+" "+key);
    }
    assert.ok(states.has(entry.status),entry.id+" invalid state");
    assert.ok(Array.isArray(entry.evidence),entry.id+" evidence must be an array");
    if (entry.status==="pass" || entry.status==="fail" || entry.status==="inconclusive") {
      assert.ok(entry.evidence.length>0,entry.id+" lacks evidence");
      assert.match(entry.sourceSha||"",/^[0-9a-f]{40}$/,entry.id+" lacks exact build SHA");
      assert.ok(entry.testedAt && !Number.isNaN(Date.parse(entry.testedAt)),entry.id+" lacks date");
      assert.ok(typeof entry.reviewer==="string" && entry.reviewer.trim(),entry.id+" lacks reviewer");
    }
    if (entry.status==="not-tested") {
      assert.deepEqual(entry.evidence,[],entry.id+" must not imply prior evidence");
    }
  }
});
