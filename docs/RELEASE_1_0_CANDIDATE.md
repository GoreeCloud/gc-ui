# GoreeCloud UI — exact 1.0.0 draft release candidate

**NOT STABLE, NOT TAGGED, NOT PUBLISHED.** This isolated draft PR deliberately packs an exact-version `@goreecloud/ui@1.0.0` archive to exercise the real target version instead of a prerelease suffix. It does **not** approve a Stable release or override any of the eight mandatory gates. [Release manifest](../registry/release-candidate.v1.json) records the base commit; its own exact source SHA must be read from GitHub after commit and CI, because a commit cannot embed itself.

- Source parent: [`5eaf78ca42cada35d835536ce0c053834cc2b874`](https://github.com/GoreeCloud/gc-ui/commit/31732dcfb7ace59701db6781f06adbfadffe1028).
- Frozen candidate API: `@goreecloud/ui/foundation`, semantic tokens/CSS, original icons and native pattern helpers. Root `@goreecloud/ui` and eight advanced controller paths remain **preview-compatibility**; no native SDK or consumer migration is included.
- Run all four GitHub Actions jobs **on this candidate commit**: Node 20, 22 and 24 source and offline-installed package QA with archive SHA-256/SHA-512 evidence, and Chromium source/installed-tarball smoke with new screenshots. Prior 53 PNGs and artifact hashes from source `c235f9b5` are a verified **historical alpha baseline**, not release-candidate evidence.
- Review the exact-version screenshots and source/license records, resolve first-party identity asset distribution policy and actual provider-enforced branch protections; on November 13 GitHub reported `main.protected=false`, required checks off. These are not waived merely because candidate CI runs.
- `npm run release:verify` remains fail-closed; `prepublishOnly` will reject ordinary publish attempts. No tag/npm release, download mirror, production deploy or repository publication is created by this candidate PR.

Follow [release and rollback runbook](RELEASE_1_0_RUNBOOK.md). If rejected, retain or close this draft candidate and roll back by reviewed PR; previous source baseline [`c235f9b5`](https://github.com/GoreeCloud/gc-ui/commit/c235f9b5e2577c440465de0d455372c363f4d01d) had green alpha CI but **was never proven published to npm**. Do not invent a previous installable version.


## 2026-11-13 exact-source regeneration

This candidate has incorporated merged source hardening through PR #108, including verified npm install hook/dependency policy, an owner-run read-only protection diagnostic, and independent screenshot artifact digest checking. Its previous 1.0.0 archive hashes and screenshot IDs refer to older branch commits and **must not be reused as current-candidate evidence**. The current SHA and any verified run must be recorded externally in issue #85 after CI, because a commit cannot contain its own final hash. The package remains deliberately unpublishable while release gates are open.
