# GC UI — GitHub Actions commit pinning (November 6, 2026)

**Scope:** Development CI reproducibility and third-party action supply-chain guardrail, **not** production release, independent security certification, or repository rule enforcement.

The GC UI quality and conditional native-host workflows previously referenced `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`, and `actions/setup-java@v4`. Those major tags may be retargeted upstream without any GC UI pull request. This change pins existing action families to the verified full release commit SHA; it does **not** introduce a new action or upgrade the major version.

| Action | Exact official release | Verified SHA |
| --- | --- | --- |
| [`actions/checkout`](https://github.com/actions/checkout/releases/tag/v4.4.0) | v4.4.0 | `11d5960a326750d5838078e36cf38b85af677262` |
| [`actions/setup-node`](https://github.com/actions/setup-node/releases/tag/v4.4.0) | v4.4.0 | `49933ea5288caeca8642d1e84afbd3f7d6820020` |
| [`actions/upload-artifact`](https://github.com/actions/upload-artifact/releases/tag/v4.6.2) | v4.6.2 | `ea165f8d65b6e75b540449e92b4886f43607fa02` |
| [`actions/setup-java`](https://github.com/actions/setup-java/releases/tag/v4.9.1) | v4.9.1 | `cf277c60eb25467037889841efdb72551f06f6c3` |

On November 6, 2026, the authenticated GitHub CLI read `GET /repos/actions/{repository}/git/ref/tags/{release}` for each release and independently verified the returned 40-hex SHA exactly matched the above. `GET /repos/actions/{repository}/commits/{sha}` returned `commit.verification.verified=true`, `reason=valid` for all four. A verified commit signature is **not** a guarantee of benign code or unreported vulnerabilities. All four actions were already used by the workflows; the change freezes their reviewed upstream revisions.

`tests/github-action-pins.test.mjs` enforces full SHAs for every remote `uses:` dependency, and an explicit inventory for these four official actions with the inline version annotation. Future maintenance: inspect official release notes/source and signature, update workflow refs and allowlist together in a reviewed PR, and run source plus full hosted CI. Prefer not to use mutable tags as a workaround. No lockfiles, code dependencies or permission scopes change.

**Important unresolved enforcement gap:** Authenticated repository readback on November 6 confirmed `main` is unprotected with no effective rulesets. Successful voluntary CI runs are not GitHub-required checks. The existing P1 owner/admin authorization gate for branch protection and mandatory PR reviews remains OPEN; **this pinning alone does not block direct main pushes, protect secrets, or constitute independent Wardveil signoff**. Native host workflows remain path-filtered; never mark them globally required without a compatible always-on sentinel.

**Validation status:** This document describes a review-branch candidate until its exact-head hosted CI succeeds and the verified commit is merged. Do not label the change deployed, certified, or main-integrated based solely on this document.
