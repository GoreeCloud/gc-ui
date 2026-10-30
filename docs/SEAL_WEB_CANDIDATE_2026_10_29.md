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

## Related sources

- [Scoped release policy](STABLE_RELEASE_SCOPE.md)
- [Release plan](RELEASE_PLAN_V1.md)
- [Experimental web API](WEB_API_ALPHA.md)
- [Implementation status](IMPLEMENTATION_STATUS.md)
- [Design-system succession](DESIGN_SYSTEM_SUCCESSION.md)
- [Stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78)
- [Consumer cutover issue #13](https://github.com/GoreeCloud/gc-ui/issues/13)
- [Candidate package README](../release/seal/README.md)
