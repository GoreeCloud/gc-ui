# GoreeCloud UI — Stabilization and Accessibility QA

**Date:** 2026-10-16  
**Repository:** `GoreeCloud/gc-ui` only  
**Maturity:** `0.2.0-alpha.1`; experimental, unpublished, not WCAG-certified

This report captures **observed local runs on the authorized Linux laptop**. It is not evidence of GitHub Actions success, visual approval, or completed mobile assistive-technology testing.

## Changes verified

- `initTabs` rejects multiple tab controls targeting the same tab panel; disabled states include both `disabled` and `aria-disabled="true"`. Tests cover programmatic clicks on disabled tabs and keyboard navigation.
- `initDialog` now closes a still-open native modal during controller teardown, unregisters listeners, restores its trigger focus when available, and rejects further calls to destroyed instances.
- The adaptive laboratory updates browser titles with the full product name **GoreeCloud UI**, while retaining short **GC UI** labels in compact app chrome.
- The Foundations Lab's labeled semantic-color sample area now uses `role="group"` instead of an unlabeled generic role.
- The browser menu test verifies the trigger's `aria-controls` ID exactly matches the corresponding live menu.
- An axe-core **4.10.3** smoke gate is pinned for Chromium and stores inconclusive check details separately from confirmed violations.

## Laptop verification inventory

| Check | Observed result | Interpretation |
| --- | --- | --- |
| `npm run check` | **66/66 Node tests passed** | Includes source, API, packaging, theme, keyboard, ARIA and branding contracts |
| Color audit from `npm run check` | **7,988/7,988 opaque semantic pair checks passed**, over 722 generated schemes | Does not measure translucent composite text or actual screen-reader experience |
| `npm run test:e2e:interaction` | **20/20 Chromium interaction tests passed** | Includes new modal, title and disabled-tab checks |
| `npm run test:e2e:firefox` | **20/20 Firefox interaction tests passed** | Same scripted interactions on a second desktop browser engine |
| `npm run test:e2e:visual` | **8/8 capture tests passed** | Screenshots created, **not yet manually approved** |
| `npm run test:e2e:accessibility` | **4/4 Chromium axe WCAG 2.0/2.1 A/AA smoke tests passed** | Zero confirmed violations in the four lab pages in this automated scan; inconclusive checks remain |

## Accessibility limits and manual review

The exploratory axe scan yielded **inconclusive** (not failing) checks for layered color contrast and some ARIA heuristics. A concrete semantic issue was fixed: the color-role sample container's `aria-label` lacked an appropriate role. The menu's `aria-controls` reference is verified in-browser and points to an existing `role=menu` ID, but axe can still mark that relation inconclusive. Do not suppress these findings or mistake them for passes.

Color contrast on blended backgrounds, visible focus under zoom, Windows forced-colors, Android TalkBack, keyboard navigation at large zoom, and real device touch testing remain manual release gates. A positive scan cannot certify WCAG conformance.

## Reproduction

```bash
cd ~/gc-ui
npm run check
npm install --no-save --no-package-lock @playwright/test@1.64.1 axe-core@4.10.3
npm run test:e2e
npm run test:e2e:firefox
```

The combined Chromium browser command sequentially runs **20 interactions + 4 automated accessibility checks + 8 screenshot captures**. Firefox separately runs the 20 interactions. Playwright attaches JSON with axe incomplete findings to its test report.

## Follow-up release gates

1. Review the captured screenshots visually, including high-contrast and 320px viewports.
2. Manually check axe inconclusive ARIA/contrast locations and validate TalkBack on a user-authorized device.
3. Check real keyboard focus and screen-reader output on supported desktop browsers.
4. Observe completed GitHub Actions runs and triage any CI-specific differences.
5. Keep catalog maturity truthful: **24 experimental**, **39 specification-only**, **0 stable**, out of 63 patterns.

**Security and evidence:** no device screenshots, private terminal state, or hardware identifiers are committed with this QA report.
