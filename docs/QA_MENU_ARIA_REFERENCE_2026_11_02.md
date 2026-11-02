# GC UI — Menu ARIA ID reference acceptance (2026-11-02)

The existing axe accessibility manifest has five **incomplete**, not confirmed-failure, occurrences of `aria-valid-attr-value` for the Components workspace-actions trigger and its dynamically assigned `aria-controls="gc-file-actions"`. This report must not treat axe uncertainty as a waiver or automatically recategorize the finding.

The new cross-browser checks reproduce the five original environments: base Components, forced colors, menu open, menu open with forced colors, and dark mode. On the actual browser DOM, the trigger resolves its `aria-controls` to **exactly one connected element** with `role="menu"` and a matching `aria-labelledby` back-reference. When opened, the trigger exposes the correct expanded state, the named menu is visible, focus reaches its first enabled item, an unavailable command retains `aria-disabled`, and Escape closes the menu and returns focus to the trigger.

**Local results:** 5/5 Chromium and 5/5 Firefox checks passed. No runtime UI changes were needed. This is supported DOM/keyboard/browser accessibility-tree contract evidence for the particular incomplete rule, not an assertion of screen-reader output under all configurations. The actual Linux Orca diagnostic was separately verified twice on November 2 with four generated-speech classes and six named AT-SPI roles in each run. Human-heard and additional platform testing remain separate.

**Disposition:** The five original axe occurrences remain inconclusive in the source manifest and must remain visible in manual-review reporting; this checkpoint supplies focused corroborating evidence, not silent suppression. All other complex-background and non-text contrast findings, full RTL/localization, screenshot-led owner visual acceptance and alpha/Seal release gates remain open.

Related: [Axe incomplete triage](QA_AXE_INCOMPLETE_TRIAGE.md), [Orca report](QA_ORCA_FOCUS_REVIEW_2026_11_01.md), [stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78).
