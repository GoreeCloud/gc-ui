# GC UI — Bounded web-controller browser support contract

**Effective for internal QA:** 2026-11-01. **Contract:** `gc-ui-seal-web-browser-qa.v1`. **Release status:** NOT a published compatibility or Seal release approval.

## Covered artifact

Only the offline-installed private `@goreecloud/gc-ui@0.2.0-seal.0` 15-file package, SHA-256 `d4e33010e56f8a0383a299bd159ae86b6ac1610825abe309f679497ac4ee9ea3`. This contract does not apply to the wider `0.2.0-alpha.1` lab workspace, native hosts, downstream apps, or separately stable Foundations v1.0.1.

## Verified QA browser builds

| Browser engine | Exact observed build | Environment | Matrix result |
| --- | --- | --- | --- |
| Chromium | `156.0.8078.4` | Connected Linux Playwright QA environment | 4/4 installed-candidate scenarios |
| Firefox | `157.0` | Same Linux Playwright QA environment | 4/4 installed-candidate scenarios |

Covered QA scenarios: desktop light, mobile **viewport** dark, RTL at 320px, mobile viewport forced colors. These exact browser builds are the only **verified internal QA configurations** in this contract. They are **not minimum supported versions**, a browser-support window, proof of physical mobile devices, or general future-version warranties. CI runs additionally validate pinned browser builds, but the actual hosted versions must be taken from those runs before making version-specific claims.

**Not validated or supported for release by this evidence:** Safari/WebKit, iOS/Android mobile browsers, Windows/macOS browser+screen reader combinations, custom forced-color palettes, unknown browser versions, browser extensions, and live downstream product integrations. Their classification is *unverified*, not presumed failing or passing.

## Fail-closed evidence requirements

Each qualifying run must bind actual browser engine/version, exact source revision, archive SHA-256, screenshot byte/hash provenance, all four scenarios, both expanded/collapsed menu ARIA DOM references, keyboard behavior, opaque menu contrast and unmodified axe `incomplete` reports. Reject missing or inconsistent engine/version provenance. Any browser build or source change requires new evidence and explicit review before the QA matrix changes.

## Remaining acceptance and support commitments

Public support/version minimums, service level/support window, supported OS devices and assistive technologies **remain undecided** until independently tested and owner-authorized. Human screen-reader speech, 30 experimental axe incomplete checks/316 node occurrences, four candidate incomplete occurrences and composited/overlap contrast still require disposition. Owner visual-direction approval for six experimental areas at `fc95c3e89c14341dc5b685b6bbe7424bdd93b4f8` did not authorize Seal, production deployment or package publication.

Evidence: [QA browser matrix](../../docs/QA_SEAL_BROWSER_MATRIX_2026_11_01.md), [Seal ledger](../../docs/SEAL_WEB_CANDIDATE_2026_10_29.md), [issue #78](https://github.com/GoreeCloud/gc-ui/issues/78).
