# GoreeCloud UI — Native Forms and Recovery QA

**Date:** October 16, 2026  
**Verified release-checkpoint commit:** `d300329d4bab720221a887b81302c76a642d5eb3`  
**Repository:** `GoreeCloud/gc-ui` only  
**Package:** `@goreecloud/gc-ui@0.2.0-alpha.1`, `private: true` — not published  
**CI:** [GitHub Actions run 38978706036](https://github.com/GoreeCloud/gc-ui/actions/runs/38978706036): **all 3 jobs completed successfully**, verified at job level.

## Delivered in this wave

Four existing specification-only patterns now have experimentally implemented web references in `lab/forms.html`:

| ID | Pattern | Working treatment |
| --- | --- | --- |
| F12 | Password | Native password field, sample-only reveal control with a stable accessible name and `aria-pressed` |
| F17 | Select | Native selectable dropdown with keyboard/touch semantics and announced local preference |
| F21 | Stepper/number | Native bounded `type=number` field (1–12), edit/step buttons, disabled limits and live status |
| O54 | Error/retry state | Simulated connection error using `role=alert`, single retry, confirmation status, focus restoration, preserved local input |

The search controller was also hardened for IME composition: suggestion selection and Escape/Enter handling defer while text composition is in progress, then resume on `compositionend`.

Shared CSS lives in `styles/gc.v1.components.css`. The JavaScript specimen remains in `lab/forms.mjs` and **is not a stable package controller API**. No real credentials should be entered; no account or network APIs are called.

The canonical registry now contains **63 patterns: 32 experimental, 31 specification-only, 0 stable**.

## Observed local verification

| Check | Result |
| --- | --- |
| `npm run check` | **75/75 Node tests**; token, role and lab-asset checks passed |
| Chromium Playwright interactions | **35/35 passed** |
| Firefox Playwright interactions, single worker | **35/35 passed** |
| Chromium axe A/AA screens | **15/15 passed**, incomplete findings retained for manual review |
| Chromium screenshot-capture cases | **13/13 passed**, not complete visual signoff |
| Opaque semantic role color audit | **7,988 pair samples passed across 722 generated schemes** |
| `npm pack --dry-run --ignore-scripts` integrity | **45 files**, all **14 required exports/metadata paths** included; lab and test output excluded |

**Total passing scripted executions: 173** (75 Node + 35 Chromium + 35 Firefox + 15 axe + 13 visual captures). The separate 7,988 color samples are not counted as independent suite tests.

The laptop's local checkout was clean and synchronized when the latest source/test checks completed.

## Recovered browser-test instability

An initial two-worker Firefox run on the laptop became resource-constrained while an unrelated interactive browser session was active; **three test scenarios timed out** despite passing in GitHub CI. Those exact cases passed **3/3 in 6.2 seconds** when rerun serially. The project's Firefox smoke command was updated to `--workers=1`, after which the entire **35-case Firefox matrix passed in 34.6 seconds**. No product behavior was weakened or skipped to obtain the pass.

## Visual review findings

The Forms Lab was reviewed in desktop light and compact light/dark states. Native stepper targets were 48px and no horizontal document overflow was detected. A full-page screenshot artifact revealed an offscreen skip link painted amid scrolled content; its idle position is now absolute and off-document, switching to a fixed in-viewport affordance when focused. This was protected by a separate keyboard and scrolled-content browser regression.

Screenshot captures are evidence fixtures, **not approved pixel-diff baselines** or comprehensive UX review.

## Release gates still open

- Manual VoiceOver, TalkBack and NVDA checks, including validation-announcement and password-toggle spoken states.
- Real-language IME keyboard testing, iOS/Android virtual keyboard interaction, 200–400% zoom, translated strings and RTL entry.
- Error/retry semantics for actual asynchronous network and offline operations; the reference's deterministic simulated response is not a production data layer.
- Complete component anatomy/variant docs, production consumers, native adapters and formal visual approval.

**Accessibility qualification:** Green axe scans and sampled role contrast do not certify WCAG conformance or low-vision readability in all materials.

## Reproduce on the authorized laptop

```sh
cd ~/gc-ui
npm run check
npm run test:e2e
npm run test:e2e:firefox
```

For an installation without the test-only dependencies, install pinned Playwright and axe-core per `docs/TESTING.md`. No upload of device/session screenshots to the public repository was required for this checkpoint.
