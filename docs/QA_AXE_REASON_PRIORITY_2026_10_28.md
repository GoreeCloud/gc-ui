# GC UI — unresolved axe reasons, prioritized from retained evidence

**Baseline:** canonical main `d6121aae71f48d6c8f8a587e6c4c646b8fc322de`, browser quality run [40793817578](https://github.com/GoreeCloud/gc-ui/actions/runs/40793817578), [actual QA ZIP](https://github.com/GoreeCloud/gc-ui/actions/runs/40793817578/artifacts/12863190754). **Date:** 2026-10-28.

The original 27 per-scenario axe JSON reports recorded **30 inconclusive rule-level checks / 334 affected-node occurrences** and zero confirmed automated violations. A rule-level check may contain many nodes; an element may appear again in another screenshot state. These are **neither 334 proven violations nor 334 distinct UI elements**.

| Original axe explanation (normalized for whitespace) | Node occurrences |
| --- | ---: |
| Background color indeterminate due to background gradient | 251 |
| Content contains only non-text characters | 55 |
| Background color indeterminate because another element overlaps | 13 |
| Background partly obscured by another element | 5 |
| Background partially overlaps other elements | 4 |
| Content too short to determine whether it is text | 1 |
| **Color-contrast subtotal** | **329** |
| `aria-controls` referenced-menu existence indeterminate with `aria-haspopup` | 5 |
| **All inconclusive node occurrences** | **334** |

The current evidence verifier now emits `incompleteByReason`: exact normalized axe failure summary, originating rule, number of affected node occurrences, and scenario membership. Source reports, checksums and the existing `incompleteByRule` inventory remain available.

## Prioritized manual review

First inspect **genuine text over gradients**, especially when transparency blends with underlying material. Next inspect any text inside occluded regions and layered surfaces, including focused menus and dialogs. The **55 non-text glyph cases** are not automatically text contrast failures; check their meaning, accessible name, and relevant non-text contrast requirements separately. Review the five ARIA-control occurrences in a real OS accessibility tree and screen reader; browser-computed snapshots alone are not speech output or platform certification.

Regressions must be reproduced with computed or sampled colors, relevant context and actual visual evidence before changing tokens or component behavior. Keep every inconclusive axe result in the source artifact; do not suppress them to make the dashboard appear green.

See [QA axe triage](QA_AXE_INCOMPLETE_TRIAGE.md), [browser menu tree evidence](QA_MENU_BROWSER_ARIA_TREE.md), and [experimental workspace stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78). No workspace Stable, WCAG conformance or owner-level visual acceptance is implied.
