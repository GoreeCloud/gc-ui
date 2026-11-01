# GC UI — Web Controls Seal Qualification Ledger

**Prepared:** 2026-10-29 (UTC CI may record 2026-10-30)  
**Candidate:** `@goreecloud/gc-ui@0.2.0-seal.0` — unpublished, private QA tarball  
**Workspace:** `0.2.0-alpha.1`, still experimental  
**Supported candidate class:** opt-in browser JavaScript controllers, semantic token CSS,
component CSS and neutral/curated product palette overlay, with narrowed TypeScript declarations  
**Lifecycle status:** **qualification pending; Seal NOT granted**  
**Authoritative implementation:** `GoreeCloud/gc-ui`; separate Foundations 1.0.1 unchanged

## Why a bounded candidate?

The 63-pattern catalog describes 32 experimental web references and 31
specification-only web patterns, with native implementations still
specification-class. The actual prior stable Foundations artifact is much
narrower: semantic tokens, color generation and theme controller.
Conflating these with the current workspace or declaring all experimental
components stable would be a false release statement.

This effort isolates 16 currently implemented, dependency-free JS exports,
three real CSS surfaces, JSON tokens and types in a *private, reproducible*
tarball. It is a testable acceptance object, not a declared supported release.
It deliberately excludes full Android/Electron hosts, packaged native apps,
other experimental modules, catalog-wide component stability, and third-party
icons. This qualification path does not waive future native-product obligations.

## Evidence matrix (status as initially committed)

| Gate | Required evidence | Status |
| --- | --- | --- |
| Candidate scope and version | Exact allowlisted JS/CSS/types, no experimental imports by accident | Implemented verifier; CI result pending |
| Package reproducibility | Actual npm archive, exact file list, archive SHA-256, installed-file provenance | Implemented verifier; CI result pending |
| Installable API | Offline consumer install/import and real behavior smoke tests | Implemented verifier; CI result pending |
| TypeScript contract | Installed candidate consumer compiled with pinned TypeScript 5.9.3 | CI job pending |
| Source integrity | No unauthorized predecessor imports, source license and third-party rights retained | Existing authority/source gates; candidate-specific review pending |
| Behavior/accessibility | Tab/menu/dialog/toast/choice/disclosure keyboard, focus, rollback, state ownership, RTL, zoom, reduced motion, contrast, forced colors | Existing Chromium/Firefox and Node QA; review of **candidate exact SHA** pending |
| Visual evidence | Actual screenshot inventory and relevant polished light/dark/adaptive screens reviewed | Historical 22-image capture and axe report available; explicit candidate signoff pending |
| Native boundary | No native-host import/installers in candidate; future native deliverables separately qualified | Verifier implemented; conditional native QA pending |
| Lifecycle approval | Declared limitations, known defects, versioned qualification record and authorized decision | **Pending** |
| Downstream & predecessor migration | Each consumer/legacy retirement in separately authorized repo | Out of this bounded artifact; tracked in issue #13 |

## Quality baseline preceding the candidate

Pre-candidate `main` revision `2e0be997fa1ac40e93eee7d93a21e787e579bf22`
passed [quality CI](https://github.com/GoreeCloud/gc-ui/actions/runs/40994021949)
and [native host CI](https://github.com/GoreeCloud/gc-ui/actions/runs/40994021927).
Recent changes repaired choice focus, Neutral container semantics and invalid
toast duration handling; these are regression-protected.

An earlier retained browser artifact included 22/22 SHA-verified full-page
captures and 27 automated axe scenarios. The reported incomplete axe checks
are not automatically confirmed violations, nor do they establish
accessibility certification. Full visual/manual exception disposition,
candidate revision-specific build artifacts and target-platform claims remain
subject to exact-source verification.

## Candidate artifact procedure

```sh
npm run release:seal:web:verify
npm run release:seal:web:types
```

Only passing exact-head CI and verified signed-off evidence may change the
**qualification assessment**. This repo must not publish `0.2.0-seal.0`,
change `private:true`, alter a stable release tag, or call the full product
Seal/Stable/Anchor merely because this bounded preview builds.

When ready to decide the lifecycle stage, record candidate commit SHA,
checksum, package export list, supported browser versions, acceptance findings,
open limitations, governing lifecycle standard, date and explicit authorized
self-review/approval. Preserve provenance of the decision. Do not infer
approval from an automated CI conclusion.

## 2026-11-01 scoped visual and contrast qualification continuation

The experimental workspace remains `0.2.0-alpha.1`; the opt-in web-controls `0.2.0-seal.0` archive is **unpublished**. This dated update does **not** change the historical pending entries above into blanket release approval.

- Before this qualification continuation, canonical `main` at `89fec9f35f51d34d945751eb74e3df8629ace49a` had passed all nine exact-head [core/browser](https://github.com/GoreeCloud/gc-ui/actions/runs/41343703219) and [native-host](https://github.com/GoreeCloud/gc-ui/actions/runs/41343703209) jobs after a scoped form-control availability fix.
- At that baseline, local `npm run test:e2e:visual` passed 26 tests and generated 22 full-page screenshots. `qa:visual-evidence:verify` verified 22/22 PNG names, dimensions and hashes. Desktop/light/dark, compact/expanded, high-contrast, environment, forms and Experience Studio views were sampled through contact sheets; this is preliminary visual triage, **not** an exhaustive screen-by-screen optical acceptance.
- The installed Seal candidate's four browser scenarios (desktop light; mobile dark; RTL at 320px; mobile forced-colors) passed. Both closed and expanded menu `aria-controls` targets were checked for a single connected menu node, while axe retained its inconclusive findings instead of suppressing them.
- Added **measured opaque menu-item text contrast** to the candidate browser evidence and fail-closed manifest verifier: 14.33:1 in desktop light and mobile RTL, 9.86:1 in mobile dark. These are browser-computed **foreground versus the menu item's own opaque background**, not pixel-sampled overlapping content or full WCAG conformance.
- **Forced-color evidence is browser-specific.** Chromium reports a translucent `rgba(..., 0.8)` menu-item background, so no simple two-color text ratio is asserted in that case. Firefox can expose opaque computed system colors; such results must be measured against the same 4.5:1 threshold rather than rejected because they differ from Chromium. The menu overlaps some underlying content in the narrow RTL expanded state; retained stack/geometry samples distinguish occlusion from a proven contrast failure. Human assistive-technology announcement of the related menu ARIA attributes and broader composited/pixel visual acceptance remain unverified.
- The new contrast evidence and verifier are in development and require **exact-head GitHub checks and merged-main readback** before this checkpoint can be cited as integrated. No runtime CSS, candidate exports, native builds, consumers, production deployment, stable tag or publishing permissions have been changed in this qualification step.

**Still required for a Seal decision:** scoped browser compatibility declaration, complete relevant visual state review and defect disposition, applicable assistive-technology/contrast review, supported package/version and archive digest validation, known limitations, and a separate explicitly recorded authorized lifecycle decision. Do not treat these acceptance records as an approval or silently relax the release gates.

## 2026-11-01 Firefox forced-colors accessibility correction

The first expanded-menu opaque contrast check was introduced in [PR #146](https://github.com/GoreeCloud/gc-ui/pull/146), with all nine exact-head checks passing and merged source `f7e1b0eeae50b144390189fc5d13a10bd96bf580`. The additional *Firefox* installed-candidate acceptance run exposed a real browser-specific issue: the focused menu item rendered with **2.94:1 foreground/background contrast**, despite the earlier Chromium case reporting a translucent computed value for which no simple ratio could be asserted.

- Root cause: the shared component CSS forced the focused menu item to system `Highlight` plus `HighlightText`; the browser's resolved pair did not guarantee 4.5:1.
- Remediation under review: render focused menu text over system `Canvas` using `CanvasText`, with a visible `Highlight` outline. Other themes continue using the existing semantic palette. The revised logic tests every browser-computed **opaque** pair against 4.5:1 and retains `null` only for actual transparent values.
- Regression containment: include the installed-candidate four-scenario acceptance suite and its evidence verifier in the pinned Firefox CI job, with `axe-core` as a test-only dependency. Retain separate Chromium evidence, screenshots, assertions and before/after failure provenance.
- A targeted Firefox forced-colors test passed after the CSS correction. **Full exact-head CI, post-merge acceptance, visual review, supported environment declaration and Seal decision are still separate gates.** The candidate archive hash necessarily changes when the candidate CSS changes. Do not reuse the pre-remediation tarball checksum as the revised candidate digest.

## 2026-11-01 focused menu screenshot provenance hardening

Following the [Firefox forced-color repair](https://github.com/GoreeCloud/gc-ui/pull/147) merged on `main` at `74244053f81d57bcb0d2b34defa0f9e6774e31d2`, the installed-candidate acceptance fixture captures the **actual open, focused, forced-colors menu surface** separately from its closed-page screenshot. A retained image alone is not proof of origin or visual acceptance; the deterministic verifier now requires this fifth PNG by exact filename, checks its PNG header/dimensions, checks its byte length and SHA-256 against the same browser scenario JSON, and copies its digest/dimensions into the revision-labeled Seal acceptance manifest.

The other three scenarios explicitly record no focused-menu screenshot and the verifier refuses unexpected additional evidence. Both Chromium and Firefox four-scenario candidate tests and the strict manifest verifier passed locally for this proposal, preserving the original axe inconclusive records, open/closed popup linkage, computed contrast and limitations. Browser-focused image evidence supports human visual inspection, not manual signoff or assistive-technology speech claims. The revised work still requires exact-head CI and merged-main source verification before treating the change as integrated.

## 2026-11-01 browser-build provenance qualification

A new fail-closed **QA-only** test/verifier records the actual browser engine and version per installed-candidate scenario and rejects a mixed browser-engine/version manifest. The reproducible [browser test matrix](QA_SEAL_BROWSER_MATRIX_2026_11_01.md) records local Chromium `156.0.8078.4` and Firefox `157.0`, each with four passing offline-installed candidate scenarios and a passing evidence verifier at source `0499c2af20149ff1a821fccd51880ab0117df8e1`.

The private 15-file tarball SHA-256 is unchanged (`d4e33010e56f8a0383a299bd159ae86b6ac1610825abe309f679497ac4ee9ea3`). The owner has explicitly approved the visual direction of six experimental UI areas at `fc95c3e89c14341dc5b685b6bbe7424bdd93b4f8`, with recorded exceptions. This is not candidate Seal release approval and not an accessibility, product, native-host, or deployment authorization.

**Scope caution:** a recorded browser build is an *observed test environment*, not a minimum supported version, full compatibility claim, or a pledge covering untested browsers and OSes. Browser support must still be declared only after supported-platform reviews, applicable human assistive-technology assessment, unresolved axe/composited visual disposition, and a distinct recorded lifecycle decision. The QA change in this section requires exact-head CI and merged-main readback before being described as integrated.

## Related sources

- [Scoped release policy](STABLE_RELEASE_SCOPE.md)
- [Release plan](RELEASE_PLAN_V1.md)
- [Experimental web API](WEB_API_ALPHA.md)
- [Implementation status](IMPLEMENTATION_STATUS.md)
- [Design-system succession](DESIGN_SYSTEM_SUCCESSION.md)
- [Stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78)
- [Consumer cutover issue #13](https://github.com/GoreeCloud/gc-ui/issues/13)
- [Candidate package README](../release/seal/README.md)
