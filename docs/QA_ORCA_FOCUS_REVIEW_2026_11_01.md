# GC UI — Browser focus recovery and isolated Orca diagnostic

**Scope:** Experimental browser reference labs; no user accounts, native device enrollment, production data, publication or release promotion.

## Verified browser contracts

A dedicated Chromium/Firefox Playwright suite checks the Components action menu and Forms demonstration:

- The menu trigger exposes the named menu relationship and expanded state.
- Opening the menu focuses the first command. End, then ArrowDown, skips the explicitly unavailable Archive command and wraps to the first enabled command.
- Escape closes the menu, collapses the trigger and restores trigger focus.
- The Forms combobox exposes an active suggestion. Escape closes the list while preserving input focus.
- Submitting the intentionally empty local demonstration focuses the invalid summary. Its first error link focuses the actual project-name field, whose aria-invalid and error-description association are verified.

**Local validation:** Two targeted browser scenarios passed in Chromium (2/2) and Firefox (2/2). These are browser keyboard/ARIA contracts, not screen-reader speech validation.

## Actual assistive technology: still inconclusive

The isolated qa:browser:orca tool uses real Linux Orca and Chromium with an Xvfb/AT-SPI session, but it does not include a human listening test. On this follow-up session the AT-SPI registry exposed all six expected roles, and the browser completed both baseline interaction phases. However, Orca generated only a subset of the required fixture-specific speech. The **existing fail-closed speech check correctly did not pass**. Repeating with the original unmodified browser fixture produced the same missing speech classes, suggesting a session timing or headless speech-output issue rather than a verified regression in the new browser tests; the cause is not conclusively established. Earlier successful generated-speech evidence remains valid only for that earlier captured session.

An intermittent AT-SPI get_child_at_index() returning None also crashed the original diagnostic collector; the collector now explicitly skips null accessibility-tree children. A regression test covers null children at both application and tree levels. The real fixture speech requirements have **not** been removed, reduced, or marked resolved. The current failure remains an explicit blocker for renewed generated-speech acceptance and warrants an isolated human-heard Orca session, then platform-specific screen reader reviews as appropriate.

No new accessibility-conformance claim is established by this QA patch. Full visual approval, axe inconclusives, RTL localization acceptance and whole-alpha Stable/Seal gates remain open.

Related: [stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78), [previous bounded acceptance report](QA_EXPANDED_VISUAL_AT_RELEASE_2026_11_01.md).
