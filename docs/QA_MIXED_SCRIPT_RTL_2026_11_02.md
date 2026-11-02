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
