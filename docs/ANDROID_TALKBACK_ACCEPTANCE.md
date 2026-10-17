# Android native accessibility acceptance — manual review protocol

**Project:** GC UI Android WebView Experience Studio (alpha).
**Status:** Not certified. Run on representative Android API versions and screen sizes; record TalkBack version, WebView provider, app commit, device API, preferred font size and navigation mode.

## Preconditions and safeguards

The testing operator must control the device. Ask the operator to enable TalkBack using Android Settings > Accessibility and restore their original accessibility settings at the end. **Do not automatically toggle enabled accessibility services or mutate global Android settings via ADB.** The benchmark script does not do so. Use headphones or quiet workspace where spoken output is audible. Do not publish screen-reader logs or screenshots containing personal data.

## Human-observed pass / fail checklist

For each case record PASS / FAIL / BLOCKED, what was actually spoken, focus order, and a short sanitized note:

| ID | Action | Required result |
|---|---|---|
| TB-01 | Cold-launch with TalkBack active | Reads GC UI / Experience Studio title and enters meaningful HTML content, without a blank container trap |
| TB-02 | Swipe linear navigation from top | Brand link, appearance button, heading, three selectors, preview checkboxes, motion actions and host feedback reachable in logical order |
| TB-03 | Inspect three selectors | Each announces its label, current selection and role; switching value updates profile status |
| TB-04 | Toggle Preview without motion | Announces checked state; content and focus remain reachable |
| TB-05 | Toggle Preview resource conservation | Announces checked state; explanation readable and does not claim device battery saver changed |
| TB-06 | Press Show coordinated transition in conserve mode | Announces motion skipped through the live region; no focus jump or hidden content |
| TB-07 | Press native selection feedback | Haptic is optional, the action has a label, and outcome does not overwhelm speech |
| TB-08 | Switch appearance | Light and dark foregrounds remain legible and focus stays at the button |
| TB-09 | Follow local GC UI brand link then Android Back | Returns to meaningful Studio content without a WebView trap or duplicate history |
| TB-10 | Background to Home and reopen | Responsive and accessible; focus recovery is sensible |
| TB-11 | Enlarge text/display size and rotate | Essential controls and output are not clipped |
| TB-12 | Change battery saver and motion settings via OS UI | On resume host restrictions update; restore original settings after test |

**Blocker criteria:** Any blank WebView accessibility tree *with TalkBack active*, inaccessible essential control, absent accessible name/state, focus trap, severe clipping, or active motion when the OS requests it be reduced.

## What automated evidence does not establish

On the connected Android 16 / API 36 phone, UI Automator currently displays the native android.webkit.WebView container but not HTML descendants **with TalkBack disabled**. This is an incomplete observation—not proof that TalkBack cannot access the page and not an accessibility pass. Spoken feedback and gestures must be evaluated by a person. Automated axe A/AA browser checks test HTML semantics, not Android WebView's spoken output.

Read-only inspection commands: adb shell dumpsys accessibility; adb shell settings get secure accessibility_enabled; adb shell uiautomator dump /sdcard/gc-ui-a11y.xml. Inspect local XML; do not publish raw tree dumps. Accessibility service settings should remain under operator control.

## Exit criteria

TB-01 through TB-10 require recorded human PASS on at least one Android phone. TB-11/12 and a second Android WebView/device class remain required before production recommendations. Browser checks and performance measurements are independent evidence, not substitutes.
