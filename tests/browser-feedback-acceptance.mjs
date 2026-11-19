/**
 * Browser-level contract for the semantic feedback lab. Runs inside the
 * existing loopback-only Chromium/CDP harness (no new browser or dependencies).
 * Screenshots are source-attested with the rest of the browser evidence.
 */
import assert from "node:assert/strict";

export async function verifySemanticFeedbackLab({ browser, base, directory, join }) {
  const scenarios = [
    { name:"desktop-light", width:1440, height:900, dark:false, forcedColors:false },
    { name:"mobile-dark", width:390, height:844, dark:true, forcedColors:false },
    { name:"mobile-forced-colors", width:320, height:760, dark:false, forcedColors:true }
  ];
  for (const scenario of scenarios) {
    await browser.setViewport(scenario.width,scenario.height,{
      dark:scenario.dark,forcedColors:scenario.forcedColors
    });
    await browser.navigate(base+"/lab/badges.html");
    // A completed document navigation does not guarantee that its module
    // script has finished. Check the observable rendered data instead.
    const ready = await browser.evaluate(`(async () => {
      for (let i=0;i<60;i++) {
        if (document.querySelectorAll("#badge-examples .gc-feedback-badge").length===7) return true;
        await new Promise(resolve=>setTimeout(resolve,50));
      }
      return false;
    })()`);
    assert.equal(ready,true,"Badge lab module did not render in "+scenario.name);

    const state = JSON.parse(await browser.evaluate(`JSON.stringify((() => {
      const root=document.documentElement, selector=q=>[...document.querySelectorAll(q)];
      const visibleCount=selector("#count-examples .gc-count-badge--count")[0];
      const privateDot=selector("#count-examples .gc-count-badge--dot")[0];
      const statuses=selector("#status-examples .gc-indicator");
      const loading=selector('#async-examples [data-gc-async-state="loading"]')[0];
      const progress=selector("#progress-examples progress");
      return {
        width:root.clientWidth,scrollWidth:root.scrollWidth,viewport:innerWidth,
        forcedColors:matchMedia("(forced-colors:active)").matches,
        families:selector("#badge-examples .gc-feedback-badge").map(x=>x.dataset.gcFamily),
        statusNames:statuses.map(x=>x.textContent.trim()),
        statusTones:statuses.map(x=>x.dataset.gcTone),
        marksDecorative:statuses.every(x=>x.querySelector(".gc-indicator__mark")?.getAttribute("aria-hidden")==="true"),
        progress:progress.map(x=>({value:x.getAttribute("value"),max:x.getAttribute("max")})),
        loadingHidden:[...loading.querySelectorAll(".gc-skeleton")].every(x=>x.getAttribute("aria-hidden")==="true"),
        placeholders:loading.querySelectorAll(".gc-skeleton").length,
        asyncStates:selector("#async-examples [data-gc-async-state]").map(x=>x.dataset.gcAsyncState),
        visibleText:visibleCount?.textContent,
        visibleAccessibleName:visibleCount?.getAttribute("aria-label"),
        dotText:privateDot?.textContent,
        dotAccessibleName:privateDot?.getAttribute("aria-label"),
        dotMarkup:privateDot?.outerHTML
      };
    })())`));
    assert.equal(state.viewport,scenario.width,"Incorrect emulated width "+scenario.name);
    assert.ok(state.scrollWidth<=state.width+1,
      "Feedback lab overflows page in "+scenario.name+": "+JSON.stringify(state));
    assert.equal(state.forcedColors,scenario.forcedColors);
    assert.deepEqual(state.families,["icon","achievement","profile","status","role","recognition","notification"]);
    assert.deepEqual(state.statusNames,["Online","Away","Offline","Synced","Degraded","Failed","Stale"]);
    assert.deepEqual(state.statusTones,["positive","warning","neutral","positive","warning","negative","warning"]);
    assert.equal(state.marksDecorative,true);
    assert.deepEqual(state.progress,[{value:"3",max:"10"},{value:null,max:null}]);
    assert.equal(state.loadingHidden,true);
    assert.equal(state.placeholders,3);
    assert.deepEqual(state.asyncStates,["loading","offline","error","permission-denied"]);
    assert.equal(state.visibleText,"12");
    assert.equal(state.visibleAccessibleName,"12 example unread mentions");
    assert.equal(state.dotText,"");
    assert.equal(state.dotAccessibleName,"New activity");
    assert.doesNotMatch(state.dotMarkup,/\b12\b|example unread mentions|data-count/,
      "Private dot leaked the count or scope in "+scenario.name);

    // Use an actual browser's native form request and resulting DOM/ARIA,
    // not just the Node mock's event simulation.
    if (scenario.name==="mobile-dark") {
      const updated=JSON.parse(await browser.evaluate(`JSON.stringify((() => {
        const input=document.querySelector("#count-input");
        const form=document.querySelector("#count-form");
        const state=()=>({
          visible:document.querySelector(".gc-count-badge--count")?.textContent??null,
          accessible:document.querySelector(".gc-count-badge--count")?.getAttribute("aria-label")??null,
          dot:document.querySelector(".gc-count-badge--dot")?.outerHTML??null,
          message:document.querySelector("#count-result").textContent
        });
        input.value="120";form.requestSubmit();
        const overflow=state();
        input.value="-1";form.requestSubmit();
        const invalid={rangeUnderflow:input.validity.rangeUnderflow,...state()};
        input.value="0";form.requestSubmit();
        const zero=state();
        return {overflow,invalid,zero};
      })())`));
      assert.equal(updated.overflow.visible,"99+");
      assert.equal(updated.overflow.accessible,"120 example unread mentions");
      assert.match(updated.overflow.dot,/aria-label="New activity"/);
      assert.doesNotMatch(updated.overflow.dot,/120|example unread mentions/);
      assert.equal(updated.invalid.rangeUnderflow,true);
      assert.equal(updated.invalid.visible,"99+","Invalid entry changed previously validated state");
      assert.equal(updated.zero.visible,null);
      assert.equal(updated.zero.dot,null);
      assert.match(updated.zero.message,/0 example unread mentions/);

      // Keyboard Space on a focused native submit button must activate the
      // control and announce a new result without a fake success message.
      await browser.evaluate('(()=>{document.querySelector("#count-input").value="9";document.querySelector("#count-form button").focus();})()');
      await browser.pressSpace();
      const keyboard=JSON.parse(await browser.evaluate(
        'JSON.stringify({count:document.querySelector(".gc-count-badge--count")?.textContent,focus:document.activeElement?.textContent.trim(),message:document.querySelector("#count-result").textContent})'));
      assert.equal(keyboard.count,"9");
      assert.equal(keyboard.focus,"Update example");
      assert.match(keyboard.message,/9 example unread mentions/);
      const tree=await browser.accessibilityTree();
      assert.ok(tree.some(node=>node.role==="heading"&&node.name==="Badges and indicators"));
      assert.ok(tree.some(node=>node.role==="button"&&node.name==="Update example"));
      assert.ok(tree.some(node=>["img","image"].includes(node.role)&&node.name==="New activity"),
        "Private notification mark has no accessible generic name: "+
        JSON.stringify(tree.filter(node=>node.name?.includes("activity")).slice(0,6)));
    }
    // Preserve the keyboard-focus view as a distinct review artifact, then
    // restore scroll position for a comparable top-of-screen capture.
    if (scenario.name==="mobile-dark") {
      const focused=await browser.screenshot(join(directory,"gc-ui-feedback-mobile-dark-focused.png"));
      assert.equal(focused.width,scenario.width);
    }
    await browser.evaluate('window.scrollTo({top:0,behavior:"instant"})');
    // Screenshots support human inspection; they do not certify real-device,
    // screen-reader or aesthetic acceptance by themselves.
    const shot=await browser.screenshot(join(directory,"gc-ui-feedback-"+scenario.name+".png"));
    assert.equal(shot.width,scenario.width);
    console.log("Chromium semantic feedback "+scenario.name+
      ": badges, statuses, privacy, progress, async states and layout passed");
  }
}
