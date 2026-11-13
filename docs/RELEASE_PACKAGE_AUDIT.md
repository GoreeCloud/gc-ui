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
