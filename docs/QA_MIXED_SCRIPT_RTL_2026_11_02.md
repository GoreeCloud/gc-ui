# GC UI — Mixed-script RTL interaction and recovery checkpoint

**Date:** 2026-11-02
**Source baseline:** experimental `main` 0b74fa80c5e64e38a13ee15d68c258f4e3031854
**Status:** Browser-tested synthetic localization **fixtures**, not a shipped translation or native-language acceptance.

## Scope

The pre-existing RTL tests primarily displayed English copy under mirrored right-to-left layouts. This additional Playwright matrix exercises real browser interaction with **synthetic Arabic + Latin brand, version, numeric, email and punctuation samples** across 320px, 375px, 768px, and 1440px in both Chromium and Firefox.

For the Adaptive reference shell, each case sets a locally simulated Arabic document language and RTL direction, replaces visible route labels with bilingual test copy, navigates using the actually visible compact bottom bar, tablet rail, or desktop sidebar, and checks `aria-current`, restored heading focus, live route announcement, `bdi dir=auto` on headline/lead/breadcrumb/section copy, computed RTL text direction, hit targets, and horizontal reflow. It does not change navigation implementations or real user settings.

For Forms, the test injects simulated bilingual heading and form labels without destroying required-field markup, triggers the actual native validation/error summary, checks focus, replaces the three error-link captions with representative Arabic/Latin text, verifies wrapped-link hit targets, and follows a link back to the invalid control. It then fills **synthetic** Arabic/Latin project values and a valid email, completes the local validation flow and verifies the success state explicitly says no data was submitted or saved.

Each test captures a full-page screenshot into a disposable test-results folder and attaches the capture to the Playwright report. The contact-sheet visual review found the expected right-side rail/sidebar in the tested RTL desktop/tablet states, bottom navigation in compact layouts, and no obvious cropped headings or missing form panels. Fixed navigation in stitched full-page screenshots can appear over intermediate document sections; live viewport hit/overflow checks remain the authoritative obstruction test. This is **not** human visual signoff.

## Acceptance limits

**Synthetic fixtures are not authorized product translations.** The actual app still contains English helper copy, live announcements, ARIA landmarks and validation messages, and the fixture updates visible DOM text only after loading a test lab. Therefore the result is evidence of layout and focus robustness under representative mixed scripts, not proof of completed Arabic localization, translated screen-reader output, linguistic accuracy, or localized production functionality.

Broader NVDA/VoiceOver/TalkBack and human-heard Orca acceptance, all 30 unresolved axe inconclusive checks, full responsive/visual owner signoff and alpha/Seal lifecycle approval remain separate. No account access, deployment, package publication or production changes.

Related: [Original RTL tests](../e2e/adaptive-bidi-text.spec.mjs), [reference lab RTL tests](../e2e/reference-lab-bidi-text.spec.mjs), [stabilization tracker #78](https://github.com/GoreeCloud/gc-ui/issues/78).

## Reproducible local outcome

After adding the bilingual form-recovery round trip, the combined legacy + new RTL suites passed **24/24 Chromium and 24/24 Firefox** on the exact review source. `npm run check` passed, and the updated mixed-script scenarios alone passed **8/8 in each engine**. Twelve actual Firefox full-page captures (Adaptive, invalid Forms, recovered Forms for four widths) were retained in disposable `test-results/mixed-script-rtl/` and reviewed as a contact sheet. The images show responsive right-side RTL rail/sidebar at 768/1440, compact bottom navigation at 320/375 and visible error/success sections without apparent clipping. The fixed bottom bar position in stitched full-page captures must not be interpreted as its live scroll state; actual click/hit and root-overflow assertions are authoritative for the tested paths. All remaining English source strings reinforce that this is not a completed Arabic-localized release.

## November 3, 2026 — keyboard recovery and RTL email-token repair

**Finding:** In a synthetic Arabic/Latin RTL Forms Lab scenario, an email input inherited `direction: rtl` from the mirrored page. A live Chromium browser assertion failed at **320, 375, 768 and 1440px**, reproducing that left-to-right email identifiers were laid out under right-to-left text direction. This was a narrowly scoped input-direction issue, not proof of incorrect Arabic translations.

**Repair:** The experimental `lab/forms.html` email field now explicitly specifies `dir="ltr"`. This keeps an email address such as `team+rtl@example.org` in its natural token order while form labels, overall flow and surrounding components remain RTL. No general theme tokens, form validation rules, native apps or translation packages are changed.

**Expanded interaction regression:** `e2e/mixed-script-rtl-acceptance.spec.mjs` now activates the visible translated Adaptive route with keyboard Enter, navigates again to Library and verifies active-route and heading-focus restoration, then validates the Forms error summary and activates the first bilingual error link through keyboard focus plus Enter. The same test verifies both the email field's explicit LTR direction attribute and computed text direction. Existing pointer, navigation, form, and focus regressions remain in other suites.

**Isolated local validation:** With only the HTML repair and regression changes against main `f5c27a6139bc8a01550f6f889dfa29db12d8d3ff`, the entire eight-case mixed-script RTL matrix passed **8/8 Chromium** and **8/8 Firefox**. The repository's `npm run check` passed. A full-page Chromium screenshot of the 320px RTL Forms success state was directly examined: the email address remains legible LTR, and surrounding RTL layout and success feedback remain visible without an obvious crop. This inspection is limited to that captured screen, not blanket visual acceptance.

**Still open:** All localized Arabic copy here is a *synthetic browser fixture*, not shipped or linguistically approved product translations. Full screen-reader speech, native keyboard/platform combinations, real-device RTL, other locales, and owner visual/Seal acceptance are not established by this repair. Further hosted CI and integrated-current-main verification must be recorded for the PR's final head before merging.

## November 3, 2026 — Component Registry release-note bidi isolation

**Observed visual issue:** The archived Chromium [PR #179 browser QA screenshots](https://github.com/GoreeCloud/gc-ui/actions/runs/41721850133) include a 768px RTL Component Registry screen where the English Stable Foundations release-scope note wraps with visibly displaced trailing punctuation. Source inspection found that this note, unlike the nearby Catalog headline and lead, lacked a direction-isolating `bdi` while inheriting an RTL page direction.

**Narrow correction:** Wrap only the existing English text and its original hyperlink in a single `<bdi dir="auto">…</bdi>` inside the existing `<aside class="release-scope-note">`. This allows English punctuation and mixed version text to flow left-to-right while the parent page and note container remain RTL. The actual release URL, visible copy, semantic `aside`, tokens, styles and translations are unchanged.

**Reproduction and local tests:** A new four-viewport Catalog regression failed **4/4 Chromium** tests before the correction because the content had no explicit bidi isolate. With the HTML correction, the combined `reference-lab-bidi-text.spec.mjs` suite passed **15/15 Chromium** and **15/15 Firefox**, covering 320, 375, 768 and 1440px release-note direction, link preservation and overflow, alongside the pre-existing reference-heading checks. The repository `npm run check` also passed. A rendered 768px RTL note was captured locally and visually inspected: the parent remained RTL, the English note's computed direction was LTR and its terminal period was no longer displaced.

**Acceptance boundaries:** This is original English experimental reference content inside a mirrored test page, not a shipped Arabic translation, full bilingual copy review, native/device verification or a complete visual/localization acceptance. A screenshot of one note and passing automated checks do not demonstrate general product accessibility, Stable/Seal approval, or consumer migrations. Hosted exact-head CI and final integration must be reviewed independently.
