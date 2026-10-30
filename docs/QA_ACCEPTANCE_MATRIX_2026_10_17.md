# GC UI — Manual assistive-tech, native-host and composited-material acceptance

**Checkpoint:** 2026-10-17. **Repository:** `GoreeCloud/gc-ui` only. **Release:** experimental alpha, not a WCAG claim or hardware acceptance.

**Subsequent owner decision:** Optional platform-screen-reader listening, hardware/energy profiling and extra physical devices in this dated matrix are **not universal stable design-system release blockers**. See [Stable Release Scope](STABLE_RELEASE_SCOPE.md); individual historic QA statuses and compliance-claim limits are preserved.

## Recovered Firefox/Orca manual acceptance — owner reaffirmation (2026-10-18)

**Status: PASS (owner-confirmed).** The GoreeCloud owner explicitly reaffirmed on 2026-10-18 that the manual Firefox/Orca screen-reader acceptance had **already PASSED** and that the earlier acceptance document was accidentally purged. This is a correction and reconstruction from surviving records, **not a newly executed listening test**, restored original document, audio capture, or independently witnessed screen-reader transcript. The original session date and all per-step observations cannot be recovered from the information available here.

The surviving [human Firefox/Orca QA log](QA_REAL_BROWSER_ZOOM_2026-10-16.md) records Test 54 and Test 56 as **user-reported PASS**, with later, **post-remediation** user-reported PASS for Forms Lab Test 83 and keyboard-dismissable toast Tests 82 and 97. Earlier PARTIAL feedback for Tests 54/80 remains historical, explicitly superseded by later PASS results. The code concerns documented in earlier issue descriptions were subsequently remedied; they must not be mistaken for the current source state. Separate objective test evidence on 2026-10-18 includes 70/70 Chromium interaction tests, 56/56 Firefox interaction tests, 38/38 accessibility/reflow/zoom tests and 162/162 Node tests; exact-head [CI run 39142048452](https://github.com/GoreeCloud/gc-ui/actions/runs/39142048452) and native-host [CI run 39142048474](https://github.com/GoreeCloud/gc-ui/actions/runs/39142048474) passed.

**Scope limit:** Treat the designated manual Firefox/Orca acceptance as completed and do not demand another test solely because the source document was lost. The preserved log does not reconstruct exact spoken text, every individual post-fix focus action, or a separate native-400%-zoom transcript. No new WCAG certification, cross-platform screen-reader approval, Electron hardware acceptance, or broader stable UI promotion is implied. This dated correction supersedes the *pending* labels for F54/F56 below, not unrelated pending gates.

## Evidence status

| Gate | Status | Why |
|---|---|---|
| Firefox/Orca Test 54 / post-fix no-JS Forms Lab | **PASS — owner-confirmed manual** | Historical Test 54 and post-remediation Test 83 were reported PASS; latest owner confirmation 2026-10-18. Automated no-JavaScript Firefox/Chromium checks also pass. Individual speech transcript from the purged record is unavailable. |
| Firefox/Orca Test 56 / post-fix toast keyboard access | **PASS — owner-confirmed manual** | Historical Test 56 plus post-remediation Tests 82 and 97 were reported PASS; latest owner confirmation 2026-10-18. Keyboard dismissal, focus restoration and combined hover/focus timing also pass automated Firefox/Chromium checks. Individual audio/zoom observations from the purged record cannot be reconstructed. |
| Android/TalkBack TB-01 through TB-12 | **12/12 PASS — user reported** | The test operator confirmed every manual case passed; see [acceptance record](QA_TALKBACK_USER_ACCEPTANCE_2026_10_17.md). Spoken transcripts were not provided. |
| Electron host, real platform assistive technology | **PENDING** | Build/launch CI is not an accessible hardware-host walkthrough |
| Worst-backdrop Lens role audit | **AUTOMATED TEST ADDED; pending independent CI** | sRGB black/white endpoint model; verify against the final CI run |
| Real imagery, fonts, focus/indicators, CPU/GPU/power | **PENDING** | Requires rendered screenshots and device inspection |

As of the original pre-acceptance checkpoint, `goreecloud-vps-01` and `personal-laptop-ideapad3-01` were reported **offline**. Do not infer manual PASS from scripted assertions. The later explicit report from the person who completed all twelve TalkBack cases is recorded as **user-reported PASS**, not as assistant-observed speech. Do not copy personal screenshots, test-device IDs, account data or screen-reader audio into this public repository.

## Session setup

Use an authorized machine with a checkout of the current `main`, Node.js 22 and Python 3. Run `npm run check` and `python3 -m http.server 4173` from the repo root. For browser references, visit `http://127.0.0.1:4173/lab/forms.html`, `/lab/components.html`, `/lab/environment.html`, and `/lab/experience-studio.html`. Use invented project values and offline examples only. For the mobile host, use the repo's native-host setup guide, not a public preview served over a trusted external account.

Record environment, date, platform/browser version, assistive-technology version, test steps, actual spoken phrases where applicable, keyboard focus behavior, viewport/zoom, and **PASS / PARTIAL / FAIL / BLOCKED** per row. Do not retroactively attribute details to earlier user PASS reports.

## Test 54 — Firefox + Orca, JavaScript disabled

1. At native Firefox 100% zoom, turn off JavaScript for the test session and load a fresh Forms Lab page. **Expected:** semantic headings and links remain traversable, Check brief is disabled, a clear `JavaScript is required` explanation is present, and pressing Enter in sample text inputs never appends values to the URL or submits to a server.
2. Navigate by Orca headings/list navigation to **Find the right work**. **Expected:** the six example project names and their types are ordinary semantic list items; the count says `6 projects found`. Search projects is disabled, and its adjacent accessible description explains why filtering is unavailable.
3. Navigate to **Choose your settings** and **Make errors recoverable**. **Expected:** explanatory fallback text is available, all script-only sample settings, password reveal, stepper buttons and simulated failure are disabled. Ordinary site links still work.
4. Re-enable JavaScript, refresh, and repeat a keyboard project search (`design`), reset, invalid brief validation and corrected submission. **Expected:** suggestions, error-summary links, local-only success, and recovery actions work; no data is sent.

**Record:** actual heading/list narration, disabled-control phrasing, URL outcome, and which state is observed after restoring JavaScript.

## Test 56 — Firefox + Orca notification, current source

1. Open Components Lab at **native 100% zoom**. Move focus with Tab to **Show notification**, activate by Enter. **Expected:** polite notification is spoken without taking focus from the trigger.
2. Tab or Shift+Tab to the toast's **Dismiss notification** button. **Expected:** a visible focus ring and an actionable, spoken button name; the toast remains present past its normal six-second timeout while the button has focus.
3. Activate dismissal using **Enter**, repeat using **Space**. **Expected:** the toast disappears and focus returns to the original live trigger.
4. Repeat with pointer hover + keyboard focus overlapping. **Expected:** it stays present until **both** hover and focus have left. Retest at **native 400% Firefox browser zoom** with no clipping or unintentionally lost focus.
5. Test programmatic dismissal/teardown of a focused toast using the browser's local test harness if authorized. **Expected:** focus returns to the still-connected opener; focus that has already moved to another control is never stolen.

**Record:** what Orca actually spoke, Tab sequence, focus visibility, real zoom level, timing observations, Enter/Space results, and behavior after dismissal.

## Physical Android/TalkBack and native desktop gates

1. On an explicitly authorized Android test device with TalkBack enabled, load the isolated native Android GC UI preview. Check **readable native host profile/status**, platform capability confirmation, theme changes, focus and heading order, selection-feedback control availability, real system contrast/transparency preferences, virtual keyboard navigation and back behavior.
2. On a host with deliberately missing/invalid native injection, verify that Experience Studio announces a **browser preview**, keeps native-only controls disabled, and still permits theme/scene/profile interactions. Try a failed native subscription only in a safe test harness, not in another app's bridge.
3. With an authorized desktop Electron host, repeat a native-bridge capability check and a failed-bridge fallback, then use the available system screen reader to inspect status and keyboard traversal. Existing Linux build/launch automation is not a substitute for this step.
4. Return device settings to their initial values. If the machine or phone is offline, report **BLOCKED**, not PASS.

## Composited material acceptance

The automated auditor checks Lens normal-text foregrounds over the sRGB composite of semantic Surface at the CSS opacity, with **black and white** as backdrop bounds; it samples both default/high-contrast role schemes and 722 generated custom themes. A separate browser test samples real computed Lens colors at representative custom seeds in Chromium/Firefox. Secondary Lens copy intentionally uses the stronger semantic foreground role *only inside the Lens*.

The subsequent indicator stabilization adds a 3:1 analytic boundary check for the stronger `outlineStrong` token across the same arbitrary-backdrop extrema, plus a 3:1 focusRing check against six semantic surface roles per scheme. Browser tests additionally sample the resolved Lens border against extreme underlays and inspect the actual keyboard-focused skip-link outline in light and dark themes. These are **automated gates**, not manual signoff.

Human review must also cover real photos and gradients behind the Lens, light and dark themes, custom accents, forced colors, reduced transparency, browser native 200%/400% zoom, keyboard focus rings and UI indicators (3:1 where applicable), RTL/localized copy, font rasterization, blur/compositor differences and low-powered hardware. Record failed samples with **nonpersonal** seed, background description, foreground element, platform and observed ratio/screenshot if appropriate. Never treat an analytic endpoint result or a Playwright rendering as blanket WCAG certification.

## Acceptance record template

| ID | Device / browser / AT | Expected result | Observed result / actual spoken output | Outcome | Evidence location |
|---|---|---|---|---|---|
| F54 | Linux / Firefox / Orca; owner-reported | Safe no-JS Forms Lab, static examples, reenable JS | Latest manual results for Tests 54 and 83: PASS; step-level speech/URL transcript not preserved from the purged record. Automated no-JS tests verified separately on 2026-10-18. | PASS — owner-confirmed | [Surviving manual QA log](QA_REAL_BROWSER_ZOOM_2026-10-16.md), Tests 54/83; [2026-10-18 Chromium/Firefox CI](https://github.com/GoreeCloud/gc-ui/actions/runs/39142048452) |
| F56 | Linux / Firefox / Orca; owner-reported | Spoken toast and keyboard/focus control; native zoom acceptance | Latest manual results for Tests 56, 82 and 97: PASS; surviving record does not preserve a separate post-remediation 400% speech/zoom trace. Automated dismissal/focus/pointer tests verified separately on 2026-10-18. | PASS — owner-confirmed | [Surviving manual QA log](QA_REAL_BROWSER_ZOOM_2026-10-16.md), Tests 56/82/97; [2026-10-18 Chromium/Firefox CI](https://github.com/GoreeCloud/gc-ui/actions/runs/39142048452) |
| N-Android | 2026-10-17 user report | TalkBack TB-01 to TB-12, plus separate invalid-native-host scenario | All twelve TalkBack tests reported PASS; separate invalid-injection walkthrough was not individually reported | PARTIAL (TalkBack 12/12 PASS) | [TalkBack record](QA_TALKBACK_USER_ACCEPTANCE_2026_10_17.md) |
| N-Desktop | To record | Keyboard/AT acceptance in actual Electron host | Not yet observed | BLOCKED | — |
| Lens-visual | To record | Legible real imagery and focus/indicator contrast | Not yet observed | BLOCKED | — |

Reconcile [issue #5](https://github.com/GoreeCloud/gc-ui/issues/5) and [issue #6](https://github.com/GoreeCloud/gc-ui/issues/6) against the already-recorded owner-reported PASS results and separately verified fixes/tests. Do not reopen a completed manual test merely because its original supporting document was accidentally purged; do not fabricate the missing audio, per-step observations or exact post-remediation zoom traces.
