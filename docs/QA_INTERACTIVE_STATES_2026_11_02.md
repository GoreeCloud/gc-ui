# GoreeCloud UI — Interactive-state visual acceptance checkpoint

**Date:** 2026-11-02. **Base:** integrated experimental gc-ui main 822ed39f46753cf3a2e5425bcda27ef33fa965cf.

The existing visual acceptance matrix captures page-level views across six labs. This separate matrix captures **three real open interactive states** where a static page screenshot cannot reveal clipping, obstructed targets or focus issues:

- Components workspace-actions menu opened with the keyboard.
- Forms project-search suggestions opened with Arrow Down and an active descendant.
- Forms invalid-summary/error links after the actual Check brief action, with summary focus.

Each state runs at four environment combinations: **320px light**, **375px dark and reduced motion**, **768px RTL**, and **1440px forced colors**. The 12 scenarios assert visible open state, horizontal reflow, complete surface bounds within the viewport, expected three/four interactive targets, and hit-testing on their rendered content. Wrapped multi-line summary anchors are sampled via actual text-fragment ranges so a blank space in a union bounding box is not mistaken for a blocked link.

Each test retains one actual viewport PNG and a JSON geometry/variant record in the separate interactive-visual evidence folder. The dedicated independent verifier checks **12/12 PNG dimensions, filename/variant/target mapping, item hits and SHA-256 integrity**; it fails closed on missing/extra records. The Chromium visual suite and Firefox interaction suite each run the tests and evidence verifier through hosted CI.

**Local test evidence:** 12/12 Chromium and 12/12 Firefox tests passed on the review branch, and the 12/12 Firefox PNG/geometry files passed the verifier. The contact-sheet review confirms open/visible controls and consistent responsive hierarchy in the tested states. It also shows translucent menu surfaces over other content in compact light/dark modes: while existing menu-contrast tests pass within their stated bounds, this optical appearance deserves owner-level visual acceptance rather than an automatic cosmetic approval.

**Limits:** This is a scoped browser/visual regression, not exhaustive human signoff. It does not cover every menu/dialog state or all OS rendering modes, real screen reader speech, 400% device zoom, translated UI, every focus/scroll state, or human touch. Existing 30 axe incompletes (318 occurrences/180 distinct targets), human platform AT and experimental whole-alpha Stable/Seal gates remain independently open. No runtime styling, production deployment, package publication or release declaration is authorized by the QA result.

Related: [expanded visual checkpoint](QA_EXPANDED_VISUAL_AT_RELEASE_2026_11_01.md), [axe manual triage](QA_AXE_INCOMPLETE_TRIAGE.md), [stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78).
