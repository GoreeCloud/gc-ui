# GoreeCloud UI — Toast Controller Teardown QA

**Date:** 2026-10-16
**Scope:** `GoreeCloud/gc-ui` only
**Maturity:** unpublished `0.2.0-alpha.1`; 32 experimental, 31 specified and zero stable patterns

## Issue

`createToast(region)` had a `destroy()` method that was only an alias for `dismiss()`. It removed the current notification but did not retire the controller. Calling `show()` again after component unmount could silently append a new message and schedule a timeout, violating controller teardown and allowing obsolete UI to reappear.

## Narrow correction

- `destroy()` is idempotent, removes the active toast and cancels its timer.
- `show()` after destruction throws an explanatory error before touching the DOM.
- Older dismissal closures, `dismiss()` and repeated `destroy()` on the retired controller remain harmless.
- A new controller can reuse the same status region without messages/timers belonging to the old controller affecting it. Region-level `role=status`, `aria-live=polite` and `aria-atomic=true` are intentionally not stripped on teardown, since they belong to the host container contract.
- No change to the theme, design tokens, component catalog status, published API shape, or password/form behavior.

## Verification

A dedicated Node unit test covers destruction, post-teardown refusal, cancellation and replacement controller isolation. A live-browser regression repeats post-teardown and replacement checks against a real DOM. The targeted new scenario has passed in Chromium and Firefox locally.

`npm run check` passed on the connected Linux laptop: **83/83 Node tests**, generated token consistency, five lab asset validations, **7,988/7,988 sampled opaque color-role comparisons** across 722 schemes, and a private package dry-run including **53 files and all 14 required exports** (no test/lab output). Targeted Chromium and Firefox browser regression tests both passed.

**Remote CI verified:** [GC UI quality gates run 38989640861](https://github.com/GoreeCloud/gc-ui/actions/runs/38989640861) completed successfully for PR head `b81b0e5ee21bd57f3603e102bf496f02e1697ecd`. All three jobs passed: core source/token/color/package integrity, Chromium interaction/reflow/effective-viewport/axe/visual, and serial Firefox interaction/effective-viewport. The complete defined **208 automated test executions passed** (83 Node + 38 Chromium interactions + 5 text reflow + 8 effective-viewport + 15 axe + 13 visual captures + 46 Firefox). The separate 7,988 sampled color-role pairs are not counted as standalone tests. [PR #3](https://github.com/GoreeCloud/gc-ui/pull/3) was squash-merged into `main` as `a807ab598f6a467467718b9f81b1a93cbc89563b`. These automated checks do not establish full assistive-technology acceptance or production stability.

## Remaining release gates

Native browser zoom on supported engines, actual screen-reader announcements/interruptions, high-contrast transparency over complex imagery and manual visual approval remain open. This is not WCAG certification or an assertion that the package is production-stable.
