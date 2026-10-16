# GoreeCloud UI — Concurrent Stabilization QA

**Date:** 2026-10-16  
**Verified source commit:** `d2d1e552eb424d87d738e3e8bad17dbc37fd9028`  
**Repository:** `GoreeCloud/gc-ui` only  
**Package:** `@goreecloud/gc-ui@0.2.0-alpha.1` (private, unpublished)

## Workstream A — Adaptive interface correctness

A live-browser audit found the appearance toggle hidden on compact screens by the lab CSS. The adaptive lab now keeps a labeled, focusable **44×44px** light/dark appearance control in mobile headers, with an icon treatment that does not displace the GC UI brand or the Details action. The chosen appearance survives navigation and page reload. At 320 CSS px there is no horizontal document overflow.

The native side sheet is now anchored to logical **inline end**, with logical border radii so it opens on the expected side in right-to-left layout. Responsive verification covers 320, 375, 599, 600, 840, 1199, 1200 and 1440 CSS-pixel widths in RTL. The compact screenshot specimen now keeps the Reference demo badge together on one line.

## Workstream B — Accessibility and visual evidence

The pinned `axe-core@4.10.3` Chromium gate was extended from four baseline pages to **10 scenarios**. New states include mobile dark mode, mobile RTL navigation, an open modal side sheet, an open action menu, high-contrast dark controls, and dark foundations. Each test attaches any **incomplete** audit findings for human review and fails only on confirmed rule violations.

Two new screenshot fixtures preserve the mobile appearance behavior: 320px compact and 375px compact dark, bringing Chromium visual evidence to **10 captures**. The compact light and dark renderings were manually inspected for layout, header fit and presence of primary navigation; this does **not** approve every screenshot or constitute visual regression certification.

## Workstream C — Packaging and CI

`scripts/check-pack-manifest.mjs` runs `npm pack --dry-run --json --ignore-scripts` as part of `npm run check`. The dry run inspected **42 package files** and confirmed all **14 required export and metadata paths** are included; development labs, tests, output directories and GitHub metadata are excluded. The package remains `private: true` and **was not published**.

The current CI workflow includes the pack manifest gate, Chromium interactions, pinned axe scans, screenshot attachments, and Firefox interactions.

## Verified results

All results below were observed directly on the authorized Linux laptop at the verified source commit.

| Gate | Result |
|---|---|
| Node unit, behavior and contract tests | **66/66 passing** |
| Chromium browser interaction tests | **22/22 passing** |
| Firefox browser interaction tests | **22/22 passing** |
| Chromium axe WCAG A/AA smoke scenarios | **10/10 passing**, inconclusive findings retained |
| Chromium screenshot-capture scenarios | **10/10 passing**, not full visual approval |
| Opaque semantic contrast checks | **7,988/7,988 passing** across 722 generated theme schemes |
| npm pack dry-run | **42 files**, 14 required entries included; no publishing |
| Repository local checkout | Synchronized, clean at verified commit |

**Total scripted test executions: 130 passing** (66 Node + 22 Chromium + 22 Firefox + 10 axe + 10 visual captures). The 7,988 contrast samples are an additional audit, not extra test-suite cases.

### GitHub Actions — verified

[Workflow run 38973136941](https://github.com/GoreeCloud/gc-ui/actions/runs/38973136941), on `d2d1e55`, completed **successfully**. All three jobs were independently checked: Core integrity, Chromium browser smoke, and Firefox browser smoke. This is the actual CI result, not an inferred status.

## Remaining acceptance work

- Manual TalkBack and screen-reader interaction checks on real supported devices.
- Human approval of all captured screenshots, including high zoom, long text and forced-colors appearance.
- Real-device Android Firefox back-button/modal handling, orientation, keyboard and safe areas.
- Full product browser support matrix, RTL translation QA, and any future native adapters.
- Component maturity still **24 experimental**, **39 specification-only**, **zero stable**. These green tests do not establish WCAG conformance or production readiness.

## Reproduce

```bash
cd ~/gc-ui
npm run check
npm run test:e2e
npm run test:e2e:firefox
```

When Playwright and axe-core are not yet installed in the local workspace, install the pinned test-only tools with:

```bash
npm install --no-save --no-package-lock @playwright/test@1.64.1 axe-core@4.10.3
npx playwright install chromium firefox
```

**Evidence hygiene:** no local device photos, personal terminal state or phone identifiers have been committed.
