# GoreeCloud UI — Physical Android TalkBack interaction checkpoint

**Date:** 2026-10-16
**Scope:** Physical OnePlus N200, Android 16, Firefox for Android, local GC UI reference at `http://127.0.0.1:4173`. This report documents only activities observed using authorized USB debugging and Android accessibility-tree/screenshot inspection.

## Setup and boundary

The device owner enabled TalkBack. The TalkBack onboarding tutorial initially intercepted navigation, despite Firefox being launched behind it. During this test the tutorial was dismissed via Android Back, without disabling TalkBack. An Android Accessibility Suite notification-permission dialog subsequently appeared; it was dismissed via Back without granting notification access. The local Firefox GC UI lab was then brought to the foreground. The service remained enabled.

**Important limitation:** The connected desktop interface exposes Android input, screen images and the accessibility node tree, but does **not** capture the audio output of TalkBack. No precise spoken phrases or correct pronunciation can be asserted from these results. Green focus outlines prove visible TalkBack accessibility focus; accessibility tree nodes prove exposure of semantics, not the words actually heard.

## Verified physical interaction findings

| Scenario | Observation | Result |
|---|---|---|
| Firefox reference access | Adaptive lab loaded while TalkBack service remained enabled | Pass |
| Explore by touch | A single touch placed the green TalkBack accessibility-focus outline around the **Overview** bottom-navigation destination | Pass |
| Navigate using TalkBack activation | After focusing **Activity**, the double-tap gesture changed the Firefox WebView title to **GoreeCloud UI · Activity**, replaced the page heading with **Your activity.**, and highlighted the **Activity** destination with the green TalkBack outline | Pass |
| Current-location spoken wording | The page uses `aria-current="page"`, but neither Android's UI hierarchy nor a screenshot proves whether TalkBack says “current page” or “selected” | **Unverified audio** |
| Route announcement spoken wording | The page changed and accessibility focus visibly remained on Activity; the exact polite live-region announcement was not captured | **Unverified audio** |
| Native Details modal | TalkBack activation opened a dialog exposed to Android as `android.app.Dialog`, labeled **Designed to adapt.**; the modal description, **Close details** button and **Done** action were present | Pass |
| Modal focus isolation | While the dialog was open, the Android accessibility hierarchy exposed the modal descendants but not the underlying Overview/Activity/Library navigation | Pass for node-tree isolation |
| Modal dismissal | TalkBack activation of **Close details** closed the modal; the Activity page's accessible content returned | Pass |
| Return of accessibility focus | Closure was visually observed, but an immediate TalkBack focus-return announcement/highlight on the exact opener was not established | **Unverified** |
| Forms labels | Android accessibility hierarchy exposed Project name, Contact email and Project notes controls/labels | Pass for discoverability |
| Invalid form submission | The native form validation summary appeared with three separately clickable error links for Project name, Contact email and Project notes. Immediately after submission a screenshot showed the green TalkBack focus outline on the **Check these fields** summary | Pass |
| Editor and keyboard | Subsequent exploratory touch input focused the Project name edit field and opened the Android keyboard. This was **after** summary focus; it is not evidence of an initial error-summary focus failure | Pass for focusability; audio unverified |

The user did not need to perform the test gestures; they were sent by ADB to the physical device. Demo inputs were empty, and no account data was entered.

## Limitations and next targeted checks

1. Listen to and record TalkBack's actual spoken **current page**, links, headings, modal heading/description and the three field errors with the device owner or an authorized audio loopback.
2. Test sequential swipe navigation through all controls, especially announcement order, long names and duplicate text nodes.
3. Confirm spoken focus return to the Details trigger, not just dialog closure.
4. Test form error-link activation and its spoken field/error association, plus successful form status.
5. Test native select, password reveal/pressed states, stepper constraints, search suggestions and retry alert with TalkBack.
6. Repeat on Android Chrome, iOS VoiceOver and other required platform/browser combinations.

**Conclusion:** TalkBack-powered focus, route activation, native modal isolation and validation-summary exposure were directly checked on hardware. Exact speech/announcements and complete WCAG conformance remain **unverified**. Neither the Android accessibility settings nor the GC UI source code needed alteration to perform this checkpoint. No phone screenshots or identifying hardware/session data are committed here.
