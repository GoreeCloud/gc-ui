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

Node source checks and Playwright scenarios cover retained answers, keyboard/focus navigation, invalid-field recovery, a native date in U.S., French, Arabic (Egypt, RTL), and Japanese browser locales, 320px forced-colors layout, and no-JavaScript safety. These are bounded automated checks, not a claim of WCAG certification or finished native support. Manual screen-reader experience, real mobile date pickers, RTL, larger translations, and production data-backed flows still require relevant evidence.

This lab does not promote the maturity of any component in the registry. See [Forms contract](FORMS_CONTRACT.md) and [accessibility release gates](ACCESSIBILITY_RELEASE.md).

### November 3, 2026 — narrow RTL step-label reflow

A real Chromium **320px RTL** rendered Workflow Lab screenshot showed the English `Preferences` progress label breaking mid-word as `Preferenc / es` in the two-column step indicator, despite no document-level overflow. The same actual browser render at **375px** retained adequate two-column space. This is a narrow-layout visual defect in the experimental workflow, not evidence of translated Arabic copy.

A single targeted `max-width:360px` rule switches the four existing progress steps to one full-width column; wider mobile layouts retain two columns and desktops retain four. The accessible ordered-list structure, `aria-current="step"`, numbers, labels and navigation logic remain unchanged. In an isolated browser-render comparison at 320px, the progress list changed from two 119px columns to one 246px column with no horizontal overflow and an enabled Next action. The before/after **real screenshots** were inspected: `Preferences` becomes legible on one line. At 375px the prior two-column layout is unchanged.

The expanded browser regression checks 320px RTL standard and forced-colors/reduced-motion contexts plus 375px LTR, verifies one active marker, no root overflow, readable per-step geometry, keyboard Enter progression and focus on the next step heading. **Local verification:** full `e2e/workflow.spec.mjs` passed **9/9 Chromium and 9/9 Firefox**; repository `npm run check` passed. Hosted CI and current-main readback remain separate requirements for the eventual pull request.

**Limits:** Synthetic RTL rendering with English labels and emulated high-contrast is not an Arabic linguistic review, real 400% browser zoom measurement, native screen reader evaluation or whole-workspace Stable/Seal acceptance. A wider real translated-label and native date-picker audit remains open under [#126](https://github.com/GoreeCloud/gc-ui/issues/126).

### November 3, 2026 — broader local browser date-locale regression

The Workflow Lab's existing calendar-day review contract was exercised in Chromium and Firefox using **en-US, fr-FR, ar-EG and ja-JP** browser locale contexts. The Arabic case additionally mirrors the document `dir=rtl`, verifies the active `navigator.language`, and continues to use native `input[type=date]` rather than a fixed-format text mask. The same browser's `Intl.DateTimeFormat` produces the expected date-only summary in each context. Local focused Playwright test passed in both browsers with no simulated network submission. The test uses fictional form values and checks the no-storage/no-submit behavior already enforced for all locale cases.

This validates local browser formatting and the existing date-only UTC representation, **not** a translated Arabic or Japanese interface, regional numeral entry by a real person, voice or IME evaluation, iOS/Android native date picker operation, or production locale completeness. Issue [#126](https://github.com/GoreeCloud/gc-ui/issues/126) remains open for those obligations.
