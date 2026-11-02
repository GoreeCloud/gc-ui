# GC UI — Expanded visual, assistive-technology and release checkpoint

**Recorded:** 2026-11-01, America/Chicago.
**Verified source baseline:** main at d66b0dde31ced73ab7e8027ec43ff7c18966959d (PR #155).
**Change:** Acceptance tooling on an isolated review branch. No publication, deployment, lifecycle promotion or downstream consumer migration.

## Visual evidence

The current review branch ran the combined **50/50 Chromium Playwright visual tests**: 26 existing reference and consumer tests plus **24 new viewport/theme scenarios** in e2e/visual-acceptance-matrix.spec.mjs. The existing full-page screenshot manifest verifier passed **22/22** files with dimensions and SHA-256 integrity. The expanded verifier checks **24/24** new screenshot/geometry pairs against PNG dimensions and checksums. The exact 24-case matrix also passed **24/24 in Firefox**, with its own 24/24 verified screenshots; the hosted Firefox workflow now repeats that gate. The 24 new cases retain separate PNG and JSON files in a dedicated acceptance-matrix artifact folder, with an independent SHA-256/dimensions verifier, without altering the established 22-file capture contract.

Each of the six reference areas (Components, Catalog, Adaptive Shell, Forms, Environment and Experience Studio) was tested in four states: **320px light**, **375px dark with reduced motion**, **768px RTL**, and **1440px forced colors**. Actual browser assertions checked a visible heading, no root/body horizontal overflow and no clipped heading bounds. Contact sheets from the fresh full-page screenshots were visually inspected for desktop and mobile; the full-page Components light screenshot was separately inspected. The reviewed regions showed coherent composition and no newly confirmed heading clipping defect. **An RTL caveat remains:** forcing RTL on the untranslated English fixtures visibly shifts some sentence-final punctuation to the leading edge; real localized copy, semantic per-span direction and bidi acceptance have not been verified. The compact Adaptive fixed navigation also overlays lower content within initial full-page/screen captures; prior footer hit tests do not certify every scroll position. Downsampled sheets are not sufficient to certify every control, pixel or state.

The founder's recorded *visual-direction* approval covers the six specific experimental areas at fc95c3e89c14341dc5b685b6bbe7424bdd93b4f8 with earlier exceptions retained. This is not a new founder approval, all-screen pixel signoff or whole-product acceptance. Full-size inspection of every workflow and operating-system state, dialogs, translated content, zoomed inputs and changed screens remains open.

## Incomplete accessibility evidence and real Orca test

A current-baseline 27-scenario axe A/AA run and evidence verifier passed **27/27**, with **zero confirmed violations** but **30 inconclusive checks affecting 316 node occurrences**. Exactly **25 color-contrast checks / 311 nodes** and **five ARIA attribute-value checks / five nodes** remain. No rule was suppressed. The ARIA references concern the Components action-menu trigger and its existing menu target.

The new reproducible Linux diagnostic, scripts/qa_browser_orca.py with scripts/qa-browser-orca.mjs, launched **actual Orca 46.1** alongside a headed Chromium browser and AT-SPI registry in isolated Xvfb/D-Bus. It verified the six expected browser-exposed names/roles (Workspace actions button and menu, Duplicate workspace item, Archive (unavailable) item, Search projects combobox, Studio refresh list item), generated the four required speech classes, and completed both instrumented browser interaction phases. Its three speech-parser tests passed. Raw Orca debug logs and disposable user preferences were destroyed after parsing; the diagnostic did not change desktop accessibility settings or use real credentials.

**Limit:** This establishes real *Orca-generated* speech and browser AT-SPI exposure, not a human hearing or gesture review. It does not prove correct announcements for all focus states, Firefox/Orca parity, VoiceOver, NVDA, TalkBack, other OS color palettes, or WCAG conformance. The 311 contrast-node inconclusives remain open for composited pixel and manual review. The five ARIA inconclusives remain classified as inconclusive, with additional bounded corroborating evidence.

## Release and native acceptance

| Gate | Result | Scope |
| --- | --- | --- |
| npm run check | PASS | Tokens, authority, unit/parser tests, contrast audits, package contract |
| Foundations 1.0.1 local rebuild verification | PASS | Offline install, ten-file allowlist, checksum and restricted exports; not a newly published release |
| Unpublished Seal candidate verification | PASS | Fifteen files, integrity and offline consumer contract; not lifecycle approval |
| Native-host contract tests | PASS | Programmatic contracts, not real device acceptance |
| Desktop portability on local Linux laptop | BLOCKED | Optional locked Electron runtime absent; no dependency installation or gate bypass |
| Expanded visual suites and screenshot verifiers | Chromium 50/50, Firefox 24/24, original 22/22 and expanded 24/24 per engine PASS | Actual-browser geometry, image integrity and bounded visual review |
| Hosted source-baseline quality/native CI | PASS | Both workflows on main d66b0dde; new-branch CI still requires verification |

The publicly released **Foundations 1.0.1 subset** is separate from the root **0.2.0-alpha.1 experimental workspace**. The **0.2.0-seal.0 candidate remains unpublished**. A successful local artifact rebuild must not be confused with the released artifact checksum or a new public browser support claim.

## Unresolved acceptance

1. Inspect composited/background-dependent contrast of the 311 inconclusive nodes, prioritizing Components, Catalog, Adaptive and Environment, and preserve per-node manual review.
2. Conduct human-heard Orca navigation through expanded menus, disabled commands, Escape, Forms suggestion changes and error recovery. Add further screen readers only for supported platform release claims.
3. Review complete interactive screens at the requested sizes, states and zoom levels. Prioritize real localized RTL typography/punctuation and every compact fixed-dock scroll position; preserve before/after evidence for confirmed defects.
4. Retest optional desktop portability only with an appropriately reviewed, pinned Electron installation in a controlled environment; preserve the existing successful hosted native check independently.
5. Require exact-head PR and post-merge CI plus separate owner release acceptance before any Stable/Seal promotion or publishing.

References: [Issue #78](https://github.com/GoreeCloud/gc-ui/issues/78), [Visual QA](QA_VISUAL_ACCEPTANCE_2026_11_01.md), [axe triage](QA_AXE_INCOMPLETE_TRIAGE.md), [Stable release scope](STABLE_RELEASE_SCOPE.md).
