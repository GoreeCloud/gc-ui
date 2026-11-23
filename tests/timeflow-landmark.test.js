import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

// The illustrated timeline belongs to the main Signal Constellation region.
// It must not create a complementary <aside> landmark nested inside <main>,
// which axe-core flags and can confuse AT landmark navigation.
test("Timeflow uses a named thematic section rather than a nested aside landmark",()=>{
  const lab=readFileSync(new URL("../lab/index.html",import.meta.url),"utf8");
  assert.match(lab,/<section class="gc-timeflow-panel" aria-label="Illustrative chronological activity">/);
  assert.doesNotMatch(lab,/<aside class="gc-timeflow-panel"/);
  assert.match(lab,/<section class="gc-timeflow-panel"[\s\S]*?<ol class="gc-timeflow" data-gc-timeflow-list/);
});
