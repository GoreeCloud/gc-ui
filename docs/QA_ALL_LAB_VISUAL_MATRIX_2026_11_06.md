# GoreeCloud UI — All-Lab Visual Geometry Evidence (November 6, 2026)

| Field | Verified scope |
| --- | --- |
| Product | Experimental `@goreecloud/gc-ui@0.2.0-alpha.1` workspace |
| Work item | [Visual acceptance issue #78](https://github.com/GoreeCloud/gc-ui/issues/78) |
| Source | `e2e/visual-acceptance-matrix.spec.mjs` |
| Scenario authority | `scripts/visual-acceptance-scenarios.mjs` |
| Integrity verifier | `scripts/verify-acceptance-matrix.mjs` |
| Status | Repeatable automated browser geometry and screenshot coverage; **not** approved visual design, human AT, or release acceptance |

## Why this expands the previous review

The previous preserved viewport acceptance matrix captured **24 combinations** from six labs: Components, Catalog, Adaptive Shell, Forms, Environment, and Experience Studio. It did **not** cover five other existing HTML labs with the same direct geometry and screenshot evidence. The original 24-case findings remain point-in-time records in `QA_EXPANDED_VISUAL_AT_RELEASE_2026_11_01.md`; this update does not retroactively claim more coverage for those earlier runs.

The matrix now covers **all 11 existing `lab/*.html` pages**, including the newly included Icon Atlas, Motion Gallery, Pattern Workbench, v1, and Workflow references. A source-level regression fails when a new HTML lab is added without being represented in this inventory. The test suite and screenshot verifier import the same named inventory to avoid silently divergent page lists.

## Automated evidence contract

Each lab is checked in **four independent viewport/modality contexts**:

| Context | Simulated conditions |
| --- | --- |
| 320-light | 320×812; light |
| 375-dark | 375×812; dark; reduced motion |
| 768-rtl | 768×900; RTL direction |
| 1440-forced | 1440×900; forced colors |

The resulting **44 scenarios** exercise rendered h1 presence and viewport bounds, root/body horizontal overflow, and visible hero position. Each scenario retains its actual viewport PNG and JSON geometry metadata. The fail-closed verifier compares expected files, dimensions, full variant flags, canonical page path, heading bounds, and image SHA-256 checksums and refuses missing or unexpected evidence.

Reproduce the scoped checks in an isolated local or CI browser environment:

```sh
playwright test e2e/visual-acceptance-matrix.spec.mjs --grep "visual acceptance geometry" --workers=1
node scripts/verify-acceptance-matrix.mjs
playwright test e2e/visual-acceptance-matrix.spec.mjs --grep "visual acceptance geometry" --browser firefox --workers=1
node scripts/verify-acceptance-matrix.mjs
npm run check
```

Both browser commands recreate the same output folder; preserve the first browser's artifact before running the second if both image sets are needed for review. The verifier writes `manifest.json` into the evidence folder after validating each complete set.

## Evidence and unresolved acceptance

The isolated November 6 review also gathered **33 full-page phone/tablet screenshots** (320px light/dark and 768px light) across all 11 labs; its bounded geometry probe detected **no page-level horizontal overflow, tested heading/link clipping, or uncaught JavaScript exceptions**. That exploratory probe was supplemental local analysis, not CI or an independent human visual decision.

The expanded 44-case Chromium Playwright matrix and screenshot verifier passed locally. The full local repository `npm run check` passed with **397/397 Node tests**. The matching **44/44 Firefox** matrix cases and the independent **44/44 Firefox** screenshot verifier also passed locally. GitHub hosted checks remain separately pending at this local-review stage; only exact-head completed workflows can establish hosted success.

**This is not full acceptance.** Static captures and computed geometry cannot certify artistic design quality, all interactive states, contrast judgments, screen-reader speech, genuine translated content and RTL/IME behavior, physical devices, 200–400% manual zoom, or consumer app migration. Existing manual review and branch protection gates remain open; no stable API, token, deployment, or production maturity change is implied.
