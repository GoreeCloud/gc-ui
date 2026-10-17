# GoreeCloud UI — Physical Android TalkBack interaction checkpoint

**Date:** 2026-10-16
**Scope:** Physical OnePlus N200, Android 16, Firefox for Android, local GC UI reference at `http://127.0.0.1:4173`. This report documents only activities observed using authorized USB debugging and Android accessibility-tree/screenshot inspection.

## Setup and boundary

The device owner enabled TalkBack. The TalkBack onboarding tutorial initially intercepted navigation, despite Firefox being launched behind it. During this test the tutorial was dismissed via Android Back, without disabling TalkBack. An Android Accessibility Suite notification-permission dialog subsequently appeared; it was dismissed via Back without granting notification access. The local Firefox GC UI lab was then brought to the foreground. The service remained enabled.

**Spoken-feedback confirmation (device owner): PASS.** Following the hands-on session, the user explicitly reported: **“It read everything properly and accurately. PASS”**. This is firsthand listener confirmation for the interactions exercised in this checkpoint. The desktop connection itself still cannot capture or transcribe TalkBack audio. The precise spoken phrases were not recorded independently, and untested screens, elements and device/browser combinations are outside this pass.

## Verified physical interaction findings

| Scenario | Observation | Result |
|---|---|---|
| Firefox reference access | Adaptive lab loaded while TalkBack service remained enabled | Pass |
| Explore by touch | A single touch placed the green TalkBack accessibility-focus outline around the **Overview** bottom-navigation destination | Pass |
| Navigate using TalkBack activation | After focusing **Activity**, the double-tap gesture changed the Firefox WebView title to **GoreeCloud UI · Activity**, replaced the page heading with **Your activity.**, and highlighted the **Activity** destination with the green TalkBack outline | Pass |
| Current-location spoken wording | The page uses `aria-current="page"`; the device owner confirmed the spoken feedback was correct in the tested flow, without an independent verbatim transcription of this individual announcement | **PASS — owner-attested for tested flow; exact words unrecorded** |
| Route announcement spoken wording | The page changed and accessibility focus visibly remained on Activity; the owner reported that the tested speech read properly and accurately, though this specific live-region phrase was not transcribed | **PASS — owner-attested overall; exact phrase unrecorded** |
| Native Details modal | TalkBack activation opened a dialog exposed to Android as `android.app.Dialog`, labeled **Designed to adapt.**; the modal description, **Close details** button and **Done** action were present | Pass |
| Modal focus isolation | While the dialog was open, the Android accessibility hierarchy exposed the modal descendants but not the underlying Overview/Activity/Library navigation | Pass for node-tree isolation |
| Modal dismissal | TalkBack activation of **Close details** closed the modal; the Activity page's accessible content returned | Pass |
| Return of accessibility focus | Closure was visually observed, but an immediate TalkBack focus-return announcement/highlight on the exact opener was not established | **Unverified** |
| Forms labels | Android accessibility hierarchy exposed Project name, Contact email and Project notes controls/labels | Pass for discoverability |
| Invalid form submission | The native form validation summary appeared with three separately clickable error links for Project name, Contact email and Project notes. Immediately after submission a screenshot showed the green TalkBack focus outline on the **Check these fields** summary | Pass |
| Editor and keyboard | Subsequent exploratory touch input focused the Project name edit field and opened the Android keyboard. This was **after** summary focus; it is not evidence of an initial error-summary focus failure | Pass for focusability; spoken behavior owner-attested across tested interactions |

The user did not need to perform the test gestures; they were sent by ADB to the physical device. Demo inputs were empty, and no account data was entered.

## Limitations and next targeted checks

1. The owner heard the tested TalkBack speech and marked it **PASS**. If formal word-for-word evidence is required, separately record/transcribe **current page**, links, headings, modal details and field errors; their exact phrasing was not captured by the desktop interface.
2. Test sequential swipe navigation through all controls, especially announcement order, long names and duplicate text nodes.
3. Confirm spoken focus return to the Details trigger, not just dialog closure.
4. Test form error-link activation and its spoken field/error association, plus successful form status.
5. Test native select, password reveal/pressed states, stepper constraints, search suggestions and retry alert with TalkBack.
6. Repeat on Android Chrome, iOS VoiceOver and other required platform/browser combinations.

**Conclusion:** TalkBack-powered focus, route activation, native modal isolation and validation-summary exposure were checked on hardware, and **the device owner confirmed that the spoken output for tested interactions was proper and accurate: PASS**. Exact phrases were not independently recorded; additional interactions and WCAG conformance remain unverified. After the owner explicitly requested disabling TalkBack, the service was turned off through USB and checked: `accessibility_enabled=0`, no enabled accessibility services, with Firefox still foreground. No phone screenshots or identifying hardware/session data are committed here.
