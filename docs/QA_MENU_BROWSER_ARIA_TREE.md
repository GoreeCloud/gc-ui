# GC UI — menu browser accessibility-tree evidence

**Scope:** Components Lab, experimental workspace. **Status:** additional automated evidence; manual assistive-technology acceptance open.

The Components menu has a persistent `aria-controls="gc-file-actions"` reference. Axe has marked that reference **incomplete** in several screens while the target is collapsed/hidden. An inconclusive result is not an established ARIA defect, and the controller must not be rewritten just to suppress it.

The live Chromium accessibility screen now uses `ArrowDown` from the trigger to expose the expanded menu, checks that the first enabled action is focused, and saves browser-computed `ariaSnapshot()` trees for both the trigger and menu. It runs in ordinary and operating-system forced-colors modes. Both records are retained in the normal accessibility JSON artifact; the inventory verifier rejects missing or malformed snapshots. Trigger and menu roles, names, expanded state, disabled action and keyboard focus are checked before saving.

## What the evidence supports

Browser-level computed accessibility names and roles are visible, with a named expanded menu and its items while focus is inside it. The two tree snapshots can be compared across CI revisions and inspected alongside the existing focused-menu full-page screenshot.

## What remains unverified

Playwright ARIA snapshots are **not** screen-reader speech transcripts or native accessibility-tree exports. Manual Windows Narrator/NVDA, macOS VoiceOver and other relevant assistive-technology and physical-device checks remain open. Continue retaining the collapsed-menu axe `aria-valid-attr-value` inconclusives until independent behavior and exposure can be demonstrated, and keep the composited contrast review separate.

See [QA triage](QA_AXE_INCOMPLETE_TRIAGE.md) and [stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78).
