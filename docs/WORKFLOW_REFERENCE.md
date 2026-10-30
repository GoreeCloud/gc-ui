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
