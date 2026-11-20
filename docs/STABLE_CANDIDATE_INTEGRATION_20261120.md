# Stable 1.0 candidate — November 20 protected-main integration

**Status: Draft 1.0.0 candidate, unverified and unpublished.** This review document is **not** a GoreeCloud Changelogs entry, release note, founder signoff, npm publication, GitHub tag or release decision. Official Changelogs writes must use the authorized hosted CLI/MCP only.

## Source provenance and rollback

The candidate's original November 17 branch started at protected `main` `79949b3db58f2214e8d4c4eb2b647f75e1cfc724`. Its original `sourceBaseSha` is retained as **historical provenance**, not the latest integrated source. The prior mainline integration was `1c2db317afa0a8e8132d6b6639b25fa5dd0a78de` (PR #170). The **latest verified protected-main integration** is `42965f8682c22973b4247d58238e68aa63d86523` (merged [PR #172](https://github.com/GoreeCloud/gc-ui/pull/172)). The candidate's rollback anchor now names that latest main source, rather than the stale November 17 base; this remains an *isolated* draft review branch and not a release.


No main history was rewritten, no force push or branch protection weakened, and the candidate is isolated in [draft PR #156](https://github.com/GoreeCloud/gc-ui/pull/156). A candidate merge, version tag, package publication or adoption is **not authorized by this evidence alone**.

## What is included

Protected-main source now includes semantic status/badge/async feedback; audited JavaScript source syntax; Material 3 Expressive Android adapter; Compose Multiplatform shared Kotlin UI; an Android source-composed debug APK fixture with compiled permission checks; Kotlin/Native iOS Simulator ARM64 source-compile gate; actual Chrome 200–400% browser zoom regression, the source-controlled Android emulator-only Compose touch/accessibility smoke, and opt-in local Firefox/WebKit UI lab acceptance with the compact notification dismiss fix. All of this is inherited from **existing merged main**, not newly released by the candidate.

The candidate **only** sets its own npm package version to `1.0.0` for test-package evaluation and retains the narrower frozen web-foundation export set, compatibility-preview root and deferred controllers. All eight mandatory release gates remain **open**. The `prepublishOnly` gate must fail until validated approval and independent evidence are recorded.

## Verification checklist before any release decision

- Run `npm run check`, `npm run verify:package`, `npm run browser:smoke`, `npm run browser:packed`, and `npm run release:status` on the **exact integrated candidate commit**. Check required Node 20/22/24, Chromium and cross-Node reproducibility jobs on that exact PR head; do not reuse historical PR badges.
- Capture the exact candidate SHA, package SHA-256, build artifact provenance and screenshots in the [Stable gate issue #85](https://github.com/GoreeCloud/gc-ui/issues/85) after independent readback. Keep the machine-readable in-source `candidateEvidence` null until the applicable source-independent release-gate process authorizes it.
- Finish public API freeze; offline consumer install and package reproducibility; source/license/asset/privacy/security checks; browser/visual/error recovery across the proposed supported matrix; maintenance/rollback; independently verified repository controls; and founder release authorization, plus the Changelogs release record.
- **Still unverified:** human founder premium visual approval; supported-version Firefox/Safari and actual macOS Safari compatibility (the local Firefox/WebKit spot-check is not certification); full translated 400%/AT acceptance; actual consumer integrations; physical native-device runtime (emulator testing alone is insufficient). Kotlin/Android build success does not silently expand the Stable **web** scope.

The provenance fields `latestIntegratedProtectedMainSha` and `latestIntegrationDate` are review metadata: they record which mainline sources were merged, **not** that the resulting candidate has passed all Stable gates. A separate exact candidate commit and CI results are required after this source update.
