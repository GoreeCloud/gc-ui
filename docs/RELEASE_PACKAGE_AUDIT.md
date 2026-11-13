# GoreeCloud UI — Offline package contract verification

This is **source and package-integrity QA**, not registry publication, Stable acceptance, legal certification or full threat modeling.

`npm run verify:package` now:
1. Runs read-only checks for generated tokens, icons and exported platform token resources, without silently updating source files.
2. Packs the source entirely offline with lifecycle scripts disabled; confirms package identity and exact version.
3. Rejects missing, unsafe or traversal-based public export paths, missing type declarations, non-runtime files and unexpected installed runtime dependencies.
4. Recomputes the SHA-512 digest from the resulting tarball and checks the local npm integrity metadata.
5. Installs that specific tarball into a disposable, isolated offline consumer with install scripts disabled; loads **every declared JavaScript export entry point**, resolves every declared CSS/JSON/SVG asset path, validates parsed JSON and structural assets, and tests the legacy root compatibility module. It never fetches remote packages, services, credentials or user data.
6. Deletes temporary material on success or failure.

The test uses whichever public paths are in the current `package.json`, including newly introduced foundation paths. Its independently imported consumer does **not** prove browser cross-engine correctness, TypeScript compiler integration, file provenance from a signed release, vulnerability absence or actual downstream GoreeCloud app adoption.

The Stable 1.0 `reproducible-package` gate remains **open** until the exact 1.0.0 release candidate, source SHA, asset/license/security audit and target-version evidence are verified.

## Node and browser coverage boundary

The `package.json` alpha currently advertises `node >=20`. GitHub CI now runs the source contract, token/color checks, tests and **offline installed package consumer** on Node **20, 22 and 24 independently**, with fail-fast disabled so a single major-version incompatibility does not hide other results. The Chromium fixture stays on a separate Node 22 browser job. The extra Node checks validate these three CI-runtime families; they do **not** certify every Node minor, runtime/OS combination, Firefox or Safari, nor actual mobile touch hardware. Each distinct main-branch check is a separate quality signal; required GitHub branch-check names must be reconciled if branch protection becomes available.

Stable 1.0 browser support and release candidate gates remain open until the exact candidate commit and defined browser/device matrix are independently verified. Node 20 is retained as an existing alpha compatibility contract rather than expanded security-lifecycle advice; the 1.0 support policy must explicitly decide retained engine minimum before publication.

## Per-runtime package evidence (development only)

Every `source-and-contract (20|22|24)` GitHub Actions job invokes `node scripts/verify-package.mjs --json` in its exact checked-out worktree and uploads `gc-ui-package-evidence-node-20`, `-22`, or `-24`. JSON includes its checked-out Git HEAD, package version, archive SHA-256 and SHA-512 integrity, Node/npm versions, packed-file inventory and a successful isolated offline install/import check. PR checks may run against a synthetic merge SHA rather than the PR head. These seven-day uploads are temporary review evidence, not release archives.

The evidence explicitly declares `development-evidence-not-stable`, `published: false` and `signed: false`. Archive hash verification does not independently establish cross-runtime reproducibility, SBOM completeness, a signed provenance attestation, human device acceptance or published Stable support. For the final candidate, archive the exact verified hash and exact release SHA in a durable release record only after the separate release gate is satisfied.

## Chromium test of the offline-installed package

The separate browser job also runs `node tests/packed-foundation-browser.mjs`. Unlike the source design lab, this integration smoke first runs `npm pack --ignore-scripts --offline`, installs the resulting local tarball with lifecycle scripts disabled, and serves **only allowlisted installed library assets and a fixed fixture** from a disposable `127.0.0.1` listener under a restrictive CSP. Chromium then imports `@goreecloud/ui/foundation` via a local import map, loads the installed CSS, creates two independently themed `.gc-app` roots, confirms distinct colors and appearance settings, checks a solid Canvas fallback, and activates a real toggle-group controller. Temporary package, browser profile and listener are cleaned up after the check.

This proves **a Chromium instance in CI can load and use the packed web foundation**, not that arbitrary Chrome versions, Firefox/Safari, physical mobile hardware, production consumers, native SDKs, privacy/security compliance, or a Stable release are fully accepted. The 1.0 real-web-acceptance and reproducible-package gates remain OPEN.
