# GoreeCloud UI — protected-main Stable 1.0 candidate refresh

**Date:** 2026-11-17. **Status:** Proposed release candidate, **unverified and unpublished**. Source base: protected `main` at `79949b3db58f2214e8d4c4eb2b647f75e1cfc724`. Branch: `release/stable-web-1.0.0-current-main-20261117`. Actual candidate head SHA, CI run IDs and package digest are external post-commit evidence, to be published in the existing [Stable gate issue #85](https://github.com/GoreeCloud/gc-ui/issues/85) only after independent readback.

## Root-cause remediation

The 2026-11-13 [old draft candidate #97](https://github.com/GoreeCloud/gc-ui/pull/97) was based on pre-stabilization source. **It must not be rebased/merged mechanically:** comparing that head against protected `main` showed roughly 4,000 lines removed across newer code and tests, including availability safeguards, original icons/window-command-node controllers, strict browser/package acceptance, human visual review integrity and latest UI governance. Draft [#127](https://github.com/GoreeCloud/gc-ui/pull/127) and [#128](https://github.com/GoreeCloud/gc-ui/pull/128) also target nested older candidate branches; their historical screenshots and checks cannot substitute for exact-head validation of new source.

Instead, **begin from current protected `main`**, change only the candidate version, the plan's *unverified* status, focused version-aware tests and candidate-specific release records. Keep every current export, package distribution allowlist, security/privacy gate, required CI, protected main and original source intact. Do not merge a stale historical branch to salvage an outdated green badge. Current design enhancement [draft #153](https://github.com/GoreeCloud/gc-ui/pull/153) remains a separate unaccepted product-design review and is not accidentally promoted into the narrower web-foundation Stable API.

## What this isolated review branch changes

- `package.json` version `1.0.0` **for an exact-version tarball test only**; it remains unpublished. The `prepublishOnly` `release:verify` check stays fail-closed.
- `registry/release-plan.v1.json` records `candidate-unverified`, web foundation `candidate`, and **all eight mandatory gates as blocking/open with no in-source evidence**.
- `registry/release-candidate.v1.json` records the source base, frozen candidate exports, absence of release, exact-SHA evidence still pending, and rollback instructions. It deliberately does **not** invent an in-commit SHA, tag, signoff, screenshot or artifact digest.
- Candidate tests validate the current 20-export package boundary, preserved current-main controllers/tests, native-only runtime import behavior, and that unverified gate status prevents publish readiness. No false green status is written into source.
- Dated documentation corrects a historical branch-protection observation using authenticated current owner readback, without closing the final repository-release-controls signoff gate.

## Verification and subsequent gates

```sh
npm run check
npm run verify:package
GC_CHROME_BIN=/path/to/trusted/chromium npm run browser:smoke
GC_CHROME_BIN=/path/to/trusted/chromium npm run browser:packed
npm run release:status
npm run release:verify      # expected to FAIL while unverified
```

The first four tests must pass on **one committed, clean source SHA** and the GitHub Node 20/22/24, Chromium and cross-Node source-integrity jobs must pass again on that exact SHA. `verify:package --json` writes only **local evidence**; publish the immutable archive digest/CI URL to issue #85 after validation and independent verification. Store human/device/release approval evidence externally to avoid SHA self-reference. A passing archive check **does not** mean npm has published the package.

**Remaining eight gates:** public API final review, reproducible exact-package evidence, exact-candidate CI, supported-browser and real web visual/functional acceptance, security/privacy/source-license audit, quality/recovery and maintenance acceptance, enforceable repository/release controls with founder decision, and final release record (including CLI/MCP-managed GoreeCloud Changelogs entry under the authorized channel). All remain open until actually accepted; do not manufacture evidence to satisfy JSON fields. The rights of separately held official brand masters require independent grant review even though the tarball excludes their `assets/identity/` copies.

**No deployment or release actions:** no npm publish, GitHub release/tag, signed artifact, infrastructure update, consumer-app migration, branch-protection weakening, content deletion, or founder acceptance is performed by this candidate refresh. Revert the candidate through a normal reviewed PR if needed; protected `main` remains the working `0.1.0-alpha.0` source baseline.
