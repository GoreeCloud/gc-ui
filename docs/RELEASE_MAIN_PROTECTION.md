# GoreeCloud UI — verify and enforce main-branch release controls

**State inspected 2026-11-13:** the GitHub `GoreeCloud/gc-ui` `main` branch returns `protected: false` and `required_status_checks.enforcement_level: "off"`; `/rulesets` was empty, and this connected GitHub integration received HTTP **403** on the administration-only protection endpoint. Even an otherwise successful Stable 1.0 candidate **must not** be released on the assumption that passing CI enforces protected merges.

## Read-only diagnostic for the repository owner

Run `npm run release:controls` from this source checkout. It performs three **GET-only** GitHub API requests: branch metadata, classic branch protection, and effective branch rules. If needed, use an owner-authorized GitHub token with **Administration: read** access via the standard `GITHUB_TOKEN` environment variable. The script never prints tokens, modifies settings, downloads code, uploads files, or contacts any host except `api.github.com`. It fails closed on missing permissions, unprotected branch metadata, absent checks, unverified force-push/deletion rules or unknown administrator bypass. Output `readyForOwnerNegativeTest` is *not* an approval to publish, tag or call the library Stable.

## Required owner-side configuration

In GitHub repository **Settings → Rules → Rulesets** or **Settings → Branches**, configure the rule targeting `main` and verify it is actively enforced (not evaluation-only). Require a pull request before merging (no external reviewer approval mandate for this founder personal project), require up-to-date passing checks, prevent force pushing and deleting `main`, and enforce controls for administrators without unreviewed bypass actors. The exact five CI check names currently expected are:

- `source-and-contract (20)`
- `source-and-contract (22)`
- `source-and-contract (24)`
- `browser-smoke`
- `cross-node-package-reproducibility`

After configuring, repeat the **GET** audit and confirm each required check is present. With owner permission, create a disposable test PR with a deliberately pending/failing check and confirm GitHub **blocks merging**. Do not merge deliberately failing code, and do not attempt to weaken protections just to test them. Record the verified rule IDs, source SHA, readback result, and negative merge experiment in [release issue #85](https://github.com/GoreeCloud/gc-ui/issues/85). This owner-side validation is distinct from metadata checks; the read-only script cannot itself establish real enforcement.

No branch-protection changes have been made by this work. The draft `1.0.0` candidate remains unpublished until all eight release gates, including owner-enforced repository controls, are verified.
