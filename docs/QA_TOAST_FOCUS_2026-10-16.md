# GoreeCloud UI — Overlapping Toast Hover/Focus Stabilization

**Date:** 2026-10-16
**Scope:** `GoreeCloud/gc-ui` only
**Status:** experimental `0.2.0-alpha.1` source; no stable-component promotion

## Regression and correction

The `createToast(region)` timer previously resumed on `pointerleave` even when keyboard focus was still within the same toast. Likewise, `focusout` could restart the timer while a pointer remained over it. A live announcement could therefore disappear before a keyboard user finished reading it.

The corrected controller tracks hover and focus independently. A timed toast pauses its auto-dismissal timer while **either** state is active, resumes only when **both** have ended, ignores focus moves between descendants, and preserves the existing stale-toast guard so detached toast events cannot affect a replacement notification. `duration:0` still produces a persistent toast until explicitly dismissed. No changes to color, design tokens, package exports, registry maturity or host data handling.

## Regression coverage and observed local checks

- Added a Node unit test for concurrent pointer/focus, descendant focus changes and dismissal after both exit.
- Added a live-browser workflow that focuses a short-lived toast *before* pointer hover, moves the pointer off while focus remains and verifies it survives until blur.
- Two earlier full Firefox attempts passed the original 36 cases but timed out in the new short-duration toast scenario: async Playwright `hover()` or `focus()` began after its 120ms timeout had already expired. The fixture now focuses the notification **synchronously in the same event-loop turn as timer creation**, before Playwright moves the pointer. Targeted Chromium/Firefox retests and the final full Firefox suite passed. This was a test synchronization defect, not proof of a Firefox product defect.
- `npm run check`: **82/82 Node tests** passed; token generation and local asset checks passed.
- Opaque color-role audit: **7,988/7,988 sampled role pairs**, across 722 schemes, passed; it is not composite/photographic contrast certification.
- Package dry-run: **50 packaged files**; all 14 required exports included, with no lab/test output.
- Chromium: **37/37 interaction**, **5/5 reflow**, **15/15 axe A/AA smoke screens** and **13/13 visual evidence captures** passed.
- Firefox: final full one-worker run **37/37 interactions passed**.

**Final verified local matrix: 189/189 automated test executions passed** (82 Node + 37 Chromium interactions + 5 reflow + 15 axe + 13 visual captures + 37 Firefox interactions). The separate 7,988 sampled color-role comparisons are not counted as individual test executions.

## Follow-up gates

- GitHub Actions core/Chromium/Firefox jobs still require completed remote confirmation on the reviewed source commit; local success alone does not verify CI.
- Verify real screen-reader verbosity, announcement persistence, user-controlled dismissal and genuine hardware focus behavior; scripted hover/focus and axe do not constitute WCAG certification.
- Do not promote any of the **32 experimental, 31 specified, 0 stable** catalog entries solely from these tests.
