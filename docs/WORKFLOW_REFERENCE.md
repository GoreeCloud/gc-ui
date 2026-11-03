# GC UI — Experimental Multi-Step Workflow Reference

**Status:** Experimental browser specimen; not a stable component API or native onboarding feature.  
**Issue:** [#126](https://github.com/GoreeCloud/gc-ui/issues/126).  
**Source:** [workflow.html](../lab/workflow.html), [workflow.mjs](../lab/workflow.mjs), [workflow.css](../lab/workflow.css).  
**Checks:** [browser](../e2e/workflow.spec.mjs) and [source](../tests/workflow-lab.test.mjs).

## Founder intent and scope

This separate example demonstrates the founder's [eight UX/UI principles](UX_UI_DESIGN_PRINCIPLES.md) without turning the existing short [Forms Lab](../lab/forms.html) into a gratuitous wizard. The four phases are Basics, Preferences, Schedule, and Review. Back and Next preserve the in-memory values, validation identifies a field in error, and moving between steps focuses the new heading. Progress is textual and marks the current step with `aria-current="step"`.

Inputs are native fields with visible labels and error descriptions. The schedule uses native `type="date"` for the browser's regional editing interface. Review uses `Intl.DateTimeFormat` with the user's browser locale and an explicitly UTC calendar-day representation. This avoids hardcoded MM/DD/YYYY and inadvertent local-time day changes.

The preview **never creates or saves an account, workspace, reminder, or backup**. There is no network submit, browser storage of fields, or named HTML form payload. JavaScript-only navigation and checking are disabled in the no-script fallback. The review inserts user-supplied values only as text.

## Verification and follow-up

Node source checks and Playwright scenarios cover retained answers, keyboard/focus navigation, invalid-field recovery, a native date in US and French locales, 320px forced-colors layout, and no-JavaScript safety. These are bounded automated checks, not a claim of WCAG certification or finished native support. Manual screen-reader experience, real mobile date pickers, RTL, larger translations, and production data-backed flows still require relevant evidence.

This lab does not promote the maturity of any component in the registry. See [Forms contract](FORMS_CONTRACT.md) and [accessibility release gates](ACCESSIBILITY_RELEASE.md).

### November 3, 2026 — narrow RTL step-label reflow

A real Chromium **320px RTL** rendered Workflow Lab screenshot showed the English `Preferences` progress label breaking mid-word as `Preferenc / es` in the two-column step indicator, despite no document-level overflow. The same actual browser render at **375px** retained adequate two-column space. This is a narrow-layout visual defect in the experimental workflow, not evidence of translated Arabic copy.

A single targeted `max-width:360px` rule switches the four existing progress steps to one full-width column; wider mobile layouts retain two columns and desktops retain four. The accessible ordered-list structure, `aria-current="step"`, numbers, labels and navigation logic remain unchanged. In an isolated browser-render comparison at 320px, the progress list changed from two 119px columns to one 246px column with no horizontal overflow and an enabled Next action. The before/after **real screenshots** were inspected: `Preferences` becomes legible on one line. At 375px the prior two-column layout is unchanged.

The expanded browser regression checks 320px RTL standard and forced-colors/reduced-motion contexts plus 375px LTR, verifies one active marker, no root overflow, readable per-step geometry, keyboard Enter progression and focus on the next step heading. **Local verification:** full `e2e/workflow.spec.mjs` passed **9/9 Chromium and 9/9 Firefox**; repository `npm run check` passed. Hosted CI and current-main readback remain separate requirements for the eventual pull request.

**Limits:** Synthetic RTL rendering with English labels and emulated high-contrast is not an Arabic linguistic review, real 400% browser zoom measurement, native screen reader evaluation or whole-workspace Stable/Seal acceptance. A wider real translated-label and native date-picker audit remains open under [#126](https://github.com/GoreeCloud/gc-ui/issues/126).
