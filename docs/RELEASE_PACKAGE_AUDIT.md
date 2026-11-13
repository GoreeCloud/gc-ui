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

## Enforced brand artwork exclusion on actual packed archive

In addition to the `package.json` file allowlist, `scripts/package-audit.mjs` implements `auditPackedBrandBoundary(filePaths)`. The **actual `npm pack --json` inventory** is checked by `scripts/verify-package.mjs` and rejects any file beneath `assets/identity/`, while requiring both `assets/gc-icons.json` and `assets/gc-icons.svg`. Unit tests inject forbidden logo/app-icon paths and missing glyphs; the normal offline installed-package CI validates the true tarball contents on Node 20/22/24. This is package distribution minimization only: the source repository's official logo/artwork masters and their hashes remain unchanged, and no new trademark license is granted. Any future inclusion of official artwork requires an independent license/provenance decision and deliberate policy/code review.

## Stable web foundation runtime-only npm distribution

For 1.0 web foundation, the verified npm `files` allowlist is deliberately narrowed to `src/` (JavaScript, types, and CSS), `tokens/gc.tokens.json`, `assets/gc-icons.json`, `assets/gc-icons.svg`, `LICENSE`, and `README.md`. The mandatory `package.json` is included automatically by npm. This removes development-only `scripts/`, internal acceptance `registry/`, work-in-progress `platform/generated/`, and the many `docs/` files from consumer installs, while retaining all 19 declared public export paths (including explicitly preview-compatibility ones) and their type declarations. Repository source, native token generators and the authoritative documentation remain in GitHub unchanged.

A **second fail-closed check of actual packed file inventory**, `auditPackedRuntimeBoundary`, rejects any unexpected source path, nested secret material or non-runtime directory even if `package.json` accidentally broadens. The offline installed package tests and real Chromium consumer verify functionality after packing. Removing non-exported development files does not independently establish legal rights, browser support, signing or Stable acceptance. The exact 1.0 draft candidate must be rebuilt at its new SHA and have new tarball hashes; earlier 92-file candidate evidence is historical and must not be reused.

## Normal-consumer lifecycle and dependency enforcement

**The offline test uses `npm install --ignore-scripts` intentionally.** That is insufficient to prove that a normal consumer install is safe if someone later adds a `postinstall` or `prepare` script. `auditPackageInstallSafety` now inspects the source package manifest before packing and refuses any automatic install/uninstall/publish lifecycle hooks outside the **exact reviewed** `prepack` generated-asset check and fail-closed `prepublishOnly` release gate. It also rejects new npm runtime, optional, peer, bundled or development dependencies and executable/native build entry points. Unit tests inject hostile lifecycle/dependency variants to prove rejection. The existing isolated install and actual Chromium consumer must still pass.

This is a **1.0 no-external-dependency policy**, not a permanent ban on justified future dependencies in 1.1+. An authorized later change requires explicit source/license/security review and a versioned package policy update. The audit cannot protect consumers if someone bypasses these source checks, uses untrusted installer tooling, or publishes a different artifact than the reviewed one. No release or remote installation is performed by this check.

## Installed-package TypeScript declaration graph

The offline package verification now reads the **installed tarball** and compares all public JavaScript exports with their `.d.ts` value exports, following transitive relative declarations (including the Signal Board re-export from the root) and rejecting phantom names, missing files or external declaration dependencies. Node 20/22/24 development evidence records `publicTypeGraphChecked` and `typeEntryCount`; the fifth CI job also enforces cross-version consistency. Negative tests cover deleted or fabricated declarations and external imports. This is a **static name/path audit, not TypeScript compiler execution**; it does not verify type inference, semantic signatures, or consumer `moduleResolution` compatibility. No compiler dependency, registry/network access or Stable publication is introduced.

## Installed package file-level SHA-256 receipts

In addition to the source SHA and overall npm archive SHA-256/SHA-512, the offline consumer verifier now hashes **each actually installed file** in the disposable package using SHA-256. It rejects unsafe paths, duplicated entries, symlinks, wrong file types or sizes and unexpected total size. The development evidence `packedFiles[]` contains `path`, `size` and `sha256` for each installed file; the fifth CI job validates those fields and exact cross-Node parity. This catches same-size file mutations that a name/size comparison cannot detect. Tests use a real disposable file tree and attempt traversal, symlink and byte-tamper variants.

An offline installed file digest is a **test receipt**, not a signed provenance attestation. It does not prove that the npm registry or a downstream installation ultimately receives the same archive; that must be independently read back if an actual Stable package is ever published. Prior archived candidate hashes remain historical and cannot qualify a later SHA. 
