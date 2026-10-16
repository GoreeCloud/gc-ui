# GoreeCloud UI — Physical Android Firefox QA

**Date:** 2026-10-16  
**Repository:** `GoreeCloud/gc-ui` only  
**Verified implementation commit:** `6b5e30e5bad27c66504f4e0a04bcec0c86150b93`  
**GitHub Actions evidence:** [run 38979945053](https://github.com/GoreeCloud/gc-ui/actions/runs/38979945053), **all three jobs successful**, confirmed at job level.  
**Status:** Actual Android device checked; **not** assistive-technology or WCAG signoff.

## Test environment and boundaries

- Authorized USB-connected OnePlus N200 running **Android 16** with **Firefox for Android**.
- Local, readonly Python web server bound to laptop loopback `127.0.0.1:4173`; `adb reverse tcp:4173 tcp:4173` made the five GC UI reference labs available to the phone without exposing a public server.
- Physical portrait display: **1080×2400 pixels**. The phone also rotated into landscape (reported UI rotation 3), rendering the Forms Lab as two columns.
- Test operated **only within the GoreeCloud UI local reference pages**. Sample form values were invented; no actual account details, credentials, or network-backed form operations were used.
- The original Android auto-rotation preference was restored after a temporary, controlled portrait verification. When a non-GC UI application became foreground, further phone interaction stopped.
- Phone screenshots stayed on the laptop under temporary filenames. No raw screenshots, phone serial, or personal session content were uploaded to this public repository.

## Physical touch and interface results

| Scenario | Observation | Result |
|---|---|---|
| Browser connection and compact viewport | Firefox loaded `/lab/adaptive.html`; visible original GC mark, compact theme/Details controls, content, and fixed bottom navigation | **Passed** |
| Bottom navigation | Touch selection of **Activity → Library → Overview** changed both the `GoreeCloud UI · …` document title and the visible page heading | **Passed** |
| Appearance | Real touch switched light to dark; Android's UI tree changed the accessible action from `Switch to dark appearance` to `Switch to light appearance`; dark appearance rendered consistently | **Passed** |
| Details sheet | Header **Details** opened a full-screen native modal with named Close and visible Done actions | **Passed** |
| Android Back with modal | Hardware/software Back dismissed the modal while keeping Firefox on the Overview page; background controls became available again | **Passed** |
| Scrolling and pinned navigation | Long content scrolled while header and bottom navigation remained visible | **Passed** |
| Forms Lab navigation | Touching the Forms Lab footer link navigated to `GoreeCloud UI · Forms Lab` | **Passed**, but revealed footer clearance issue below |
| Android virtual keyboard | Touching native Project name opened the Android IME; the focused field stayed visible; Back hid the keyboard without discarding its local sample value | **Passed** |
| Validation error summary | Submitting with name entered but email and notes missing displayed two linked errors and retained the name; label/error roles appeared in Android accessibility hierarchy | **Passed** |
| Native input recovery | Sample email and notes were entered on the device, clearing field errors; no real contact information was used | **Passed** |
| Landscape preservation | The phone rotated into landscape and the Forms Lab adapted to two columns; all three sample field values persisted | **Passed** |
| Valid sample submission | A complete local-only project brief displayed `Brief ready` and confirmation that no data was submitted or saved | **Passed** |

These were guided ADB touch operations, direct screenshots, and Android `uiautomator` accessibility-tree inspection, not a general-purpose native E2E framework.

## Found and fixed: footer touch clearance

**Discovery:** On Android Firefox, the final footer row of the adaptive reference sometimes sat directly against the fixed bottom navigation. The Forms Lab link was still tappable near its upper edge, but the target was partly obscured and uncomfortably close to another navigation destination. Desktop emulation did not fully reproduce the physical browser toolbar/viewport relationship.

**Remediation:** Compact `lab/adaptive.css` footer end padding was increased from `calc(112px + env(safe-area-inset-bottom))` to `calc(168px + env(safe-area-inset-bottom))`. A new Playwright check in `e2e/adaptive.spec.mjs` requires usable footer link hit testing and **at least 80 CSS pixels** between the link bottom and the fixed navigation in simulated 320, 360 and 375 CSS-pixel viewports.

**Physical retest:** The adaptive page was loaded as a **fresh Firefox URL** to avoid reusing the previous back/forward-cached stylesheet. In portrait after scrolling, all footer links, including the second-line design-language link, remained visible above the bottom navigation. The Forms Lab link moved from the cramped bar boundary to a clearly separate location (observed Android hierarchy bounds approximately `[416,1858][591,1903]`, with bottom-navigation labels near Y 2208). Fresh screenshots confirmed the improved clearance. The original auto-rotation setting was then restored.

## Automated verification after the fix

| Gate | Result |
|---|---|
| Node tests, source/package integrity | **75/75 passed** |
| Chromium interaction suite | **36/36 passed** |
| Firefox interaction suite, 1 worker | **36/36 passed** |
| Chromium axe A/AA screening scenarios | **15/15 passed** (incomplete findings retained) |
| Chromium screenshot captures | **13/13 passed** (captures, not comprehensive visual approval) |
| Opaque role-color contrast audit | **7,988 sampled checks** passed across 722 generated schemes |
| Npm dry-run package integrity | **46 files**, all **14 required exports/metadata paths** included; no publication |

**Total: 175 passing scripted test executions** (75 + 36 + 36 + 15 + 13), in addition to the physical touch scenarios above. The verified implementation commit's [three-job CI run](https://github.com/GoreeCloud/gc-ui/actions/runs/38979945053) completed successfully.

## Real-device gates not yet approved

- **TalkBack spoken interaction** was not tested. TalkBack is installed but Android accessibility was off at the time of inspection; settings were **not changed**. This requires explicit participation and checking of actual spoken labels, focus movement, sheet isolation, and error summaries.
- Native select picker, number stepper, password reveal and search suggestion IME behavior still require physical-device interaction checks. The tested text keyboard did **not** include a non-Latin IME composition scenario.
- iOS Safari / VoiceOver, Android Chrome, different phone models, foldables, Bluetooth keyboard, zoom/large font scaling, and landscape system bars need separate matrix coverage.
- Screenshot images were inspected selectively; no comprehensive baseline review, real-world network error, or WCAG conformance certification exists.

**Handoff:** Preserve the user's device state and do not reactivate TalkBack automatically. The local URL `http://127.0.0.1:4173/lab/adaptive.html` works through the authorized laptop's USB forwarding while its local server remains active. Further phone testing should begin only when the phone is intentionally back in GC UI and available for test interaction.
