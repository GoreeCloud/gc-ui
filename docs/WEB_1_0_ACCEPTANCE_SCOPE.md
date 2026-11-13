# GoreeCloud UI — Stable 1.0 web-browser and visual acceptance scope

**Defined scope, not a released result.** Source baseline inspected: [`c235f9b5e257`](https://github.com/GoreeCloud/gc-ui/commit/c235f9b5e2577c440465de0d455372c363f4d01d). Stable 1.0 is the narrow web-foundation contract in [PUBLIC_API_BOUNDARY.md](PUBLIC_API_BOUNDARY.md); the machine-readable boundary is [web-acceptance-scope.v1.json](../registry/web-acceptance-scope.v1.json).

## Browser support policy for the first candidate

The **only verified browser configuration** for this web-foundation alpha is **headless Chromium on the GitHub-hosted Ubuntu 24.04 runner**, using the exact CI-installed Chromium binary. This is the intended *provisional* 1.0 validated browser configuration; it is **not** a declaration that every Chromium release, Windows Chrome, Microsoft Edge, mobile Chrome, Safari, Firefox or WebKit works. Node.js 22 runs the browser fixture; independent Node 20/22/24 jobs check source, tokens, public exports and offline installed package consumption. Browser and Node version claims must remain separate.

Chromium's viewport emulator verifies exact 320, 390, 600, 900 and 1440 CSS-pixel widths. Browser tests exercise eight optional accent/appearance combinations, scoped independent application colors and modes, Canvas/Surface/Lens fallback, keyboard controls, RTL, forced colors, reduced transparency/motion, dialogs, navigation and interactive installed tarball imports. **A mobile-sized Chromium viewport is not a physical Android/iOS browser test.** CSS root-font enlargement is **not** real Chrome browser zoom. The mandatory hue and mandatory appearance theme flags remain false. Any browser with no independent evidence is `not-tested`, **not certified** and not part of the initially verified configuration.

## AI-assisted baseline visual inspection (November 13, 2026)

The [passing baseline CI run](https://github.com/GoreeCloud/gc-ui/actions/runs/43447990325) contains [the screenshot artifact](https://github.com/GoreeCloud/gc-ui/actions/runs/43447990325/artifacts/14049316403), 53 actual PNGs, artifact archive SHA-256 `b9bf21d350391fbf481902ab93421b0088e24062f43b2713e7d22e39585bba37`. I retrieved the archived bytes and verified that digest locally, inspected a thumbnail overview of all 53 images, and inspected these three at their full dimensions:

| PNG / real pixel frame | AI-observed baseline result | Limit |
| --- | --- | --- |
| `gc-ui-light-desktop.png` — 1440 × 900 | Coherent premium hierarchy, desktop rail, separate control bar, intentional Canvas/Surface/Lens depth, readable content and clear actions | First visible viewport, not every scroll position |
| `gc-ui-dark-mobile.png` — 390 × 844 | Distinct mobile bottom capsule, legible dark treatment and primary typography; no obviously broken first-view layout | No physical hardware or complete scroll-path verification |
| `gc-ui-light-mobile-320.png` — 320 × 760 | Form/theme controls stack without obvious horizontal clipping; large heading wraps and navigation remains legible | Floating dock overlaps the scrollable first-view content; full reachability requires interaction evidence |

**Review decision:** selected *baseline* visual composition passes a targeted AI-assisted static inspection. The full 53-PNG automated collection is not a full 53-view human sign-off. A CSS 400% root-font screenshot shows oversized content and partial first-viewport occlusion; the automated checks report reachable reflow, but this is **not** actual browser 400% zoom acceptance. Follow-up issue [#28](https://github.com/GoreeCloud/gc-ui/issues/28) remains open. Accessibility enhancements and human AT work are advisory, not standalone internal Stable blockers under founder governance §13.2.1; do not claim human AT or accessibility certification.

## 1.0 acceptance decision boundary

Before the **exact** 1.0.0 candidate may be accepted, re-run source, package, browser and screenshot checks **on that candidate commit**, examine its resulting screenshots (including full-screen typography/controls, error and fallback states), verify what the application actually renders and does, and record the SHA/artifact hashes. If the Chromium version/runner changes, qualify the new environment independently. Review source/asset security, MIT license/trademark provenance, cleanup, rollback and verified repository merge controls separately. **A pass for this alpha baseline is not automatically valid for the candidate SHA.** Do not mark `real-web-acceptance` verified merely because this scope document exists.
