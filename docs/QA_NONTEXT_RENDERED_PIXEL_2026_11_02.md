# GoreeCloud UI — Non-text glyph rendered-pixel review

**Date:** 2026-11-02. **Base:** experimental main 0b74fa80c5e64e38a13ee15d68c258f4e3031854. **Status:** scoped visual QA evidence; whole-workspace manual acceptance OPEN.

## Tested real pixels

New browser regression samples the actual composited, text-free backdrop under five selected decorative Unicode symbols already identified for manual inspection:

- Adaptive Shell: first and third metric glyphs, first and second activity glyphs.
- Forms: recovery preview symbol inside an aria-hidden decorative preview.

It uses the existing shared sampled-backdrop helper and verifies each temporary glyph color override is restored precisely (including CSS priority) after the PNG. In **Chromium and Firefox**, five state combinations are tested: 320px light, 320px dark, 1440px light, 1440px dark, and 768px RTL light. The regression requires a conservative **minimum sampled ratio of 3:1**. These are glyph backdrop comparisons, not OCR of individual antialiased strokes.

**Local result:** 5/5 Chromium and 5/5 Firefox browser scenarios PASS. Across all five symbols per variant, the lowest sampled ratio was about **9.16:1 Chromium** and **9.45:1 Firefox**. Both runs retain **10 actual full-page PNGs** (Adaptive and Forms for five variants), JSON measurements and an independently generated SHA-256/dimensions manifest (10/10 verified in each browser). The standalone source/package check also passed.

Screenshot-led contact-sheet inspection compared all ten captures across compact/desktop light/dark and RTL states. The selected glyphs are visible in their containers, and no obvious element clipping appeared at the tested positions. The full-page stitched fixed navigation and skip-link images can differ from live scrolling and should not be treated as live defects without reproduction; the image-size overview is not human visual signoff.

## Scope and remaining work

This bounded measurement establishes sampled foreground-vs-composited-background ratios for **five particular decorative symbols**, not whole-page or 3:1 compliance certification. It does not measure every stroke's antialiasing or prove all essential non-text UI states, disabled controls, focus indicators, borders, contrast forced-colors, actual touch access, localized RTL, or native OS rendering. Existing focus/navigation and forced-colors browser suites remain independent.

The full axe incomplete inventory (historically 30 checks / 318 occurrences / 180 distinct targets, including 17 non-text-symbol targets / 55 occurrences) remains OPEN, unchanged and unsuppressed. These results can inform manual prioritization but do **not** automatically waive any node. Future manual review should prioritize informationally essential glyphs and status/control boundaries, verify 3:1 where applicable, and compare visually with approved GoreeCloud UI standards.

No production deployment, package publication, security review approval or experimental Stable/Seal promotion.

Related: [Non-text semantics](QA_NONTEXT_SYMBOL_SEMANTICS_2026_11_02.md), [axe manual triage](QA_AXE_INCOMPLETE_TRIAGE.md), [stabilization tracker](https://github.com/GoreeCloud/gc-ui/issues/78).

## 2026-11-02 QA evidence identity hardening

The independent screenshot-metadata verifier now requires the **exact five expected symbol selectors**, including their lab and order, instead of accepting any selector starting with a dot. Five pure unit tests exercise valid records, duplicates, substitutions, reordering, omissions, invalid sample data and mismatched metadata. Screenshot integrity and the recorded sampled ratios remain scoped evidence: the verifier **does not independently remeasure foreground/background contrast from the PNG bytes**, resolve the remaining axe incompletes, or replace human visual acceptance.

## November 6, 2026 — complete identity coverage candidate (review scope still limited)

The [current Chromium axe evidence](https://github.com/GoreeCloud/gc-ui/actions/runs/42305299152) lists **17 unique non-text-only symbol targets / 55 historical incomplete occurrences**, while the retained current pixel QA inventory already measures **15 distinct matching element identities**. The remaining two are the **Forms** `#demo-decrease` button and **Foundations** `.material-lens > span[aria-hidden=true]` ornament. The former is an **interactive decrement control** with a non-symbol accessible name; it must be enabled for sampling and **must not** be falsely marked decorative. The latter is a purely decorative icon accompanied by the visible LENS label.

This change proposes adding both to the existing five-variant actual-browser backdrop sampler and to its independent selector/semantic evidence verifier. The latter rejects missing, substituted or mislabeled icon/control records. **All 17 unique historical target identities would then have at least one corresponding sampled identity**, subject to exact-head Chromium/Firefox validation. This still does **not** cover all 55 scenario occurrences, antialiased strokes, disabled/hover/focus states, forced-color system pixels, physical devices or native AT. All original axe inconclusives remain unsuppressed pending manual judgment; **no overall WCAG or Stable/Seal acceptance follows**. Actual hosted browser ratios and screenshots are **pending** for this candidate.
