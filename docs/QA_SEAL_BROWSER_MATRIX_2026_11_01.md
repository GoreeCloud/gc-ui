# GC UI — Installed web candidate browser evidence matrix

**Recorded:** 2026-11-01. **Status:** engineering qualification evidence, **not** browser support certification, WCAG conformance, Seal release approval, or product deployment authorization.

## Identity and provenance

- **Repository:** `GoreeCloud/gc-ui`. **Source tested locally:** `0499c2af20149ff1a821fccd51880ab0117df8e1` (documentation-only successor to the owner's visually approved `fc95c3e89c14341dc5b685b6bbe7424bdd93b4f8`).
- **Artifact:** offline-installed private `@goreecloud/gc-ui@0.2.0-seal.0`, 15 exact allowlisted files. **Tarball SHA-256:** `d4e33010e56f8a0383a299bd159ae86b6ac1610825abe309f679497ac4ee9ea3`.
- **Runner:** Playwright `@playwright/test@1.64.1`, browser-provided version read from the real running `Browser.version()`. Browser version is evidence for the tested build, **not** a supported-minimum or a commitment to future versions.
- **Provenance gate under review:** each candidate scenario JSON records `browserEngine` and `browserVersion`; the verifier requires real versions from the allowlisted Chromium/Firefox engines and forbids mixing versions or engines within the four-scenario result manifest. Each report still pins a source SHA and screenshot digest. GitHub exact-head verification and merged-main readback are required before this new gate is integrated.

## Actual local evidence (same installed candidate)

| Browser engine | Observed browser version | Installed-candidate scenarios | Evidence verifier | Notes |
| --- | --- | --- | --- | --- |
| Chromium | `156.0.8078.4` | **4/4 passed** | **Passed** | At desktop light, mobile dark, 320px RTL, and forced-colors mobile; expanded-menu computed contrast remains recorded and inconclusive axe findings are preserved |
| Firefox | `157.0` | **4/4 passed** | **Passed** | Same four scenarios. Browser-specific forced-colors system paint is evaluated only as a numeric ratio where foreground/background are genuinely opaque |

Each scenario verifies the real offline-installed package, viewport and RTL state, interaction/focus, menu-to-popup ARIA DOM linkage in both collapsed/expanded states, screenshot PNG SHA-256/size, axe violations and incompletes, opaque menu text contrast, and the focused forced-colors menu screenshot. This remains **browser-fixture evidence**, not an assertion that every downstream consumer or OS/browser configuration behaves identically.

## Observed versus supported

**Observed tested engines/builds:** only the two versions listed above on the connected Linux QA environment. The GitHub CI pipeline independently installs and tests pinned Playwright Chromium and Firefox runners, but its exact hosted versions must be read from its own report if a version-specific claim is needed.

**Proposed future support policy:** establish minimum/browser/OS versions only after explicit cross-environment testing, documented accessibility exceptions, support lifecycle commitments and authorized lifecycle approval. Do **not** infer Safari/WebKit, mobile browser, Windows/macOS native host, screen reader, browser extensions, custom high-contrast palette, or release distribution support from this test matrix.

## Outstanding release gates

- The wider experimental workspace remains `0.2.0-alpha.1`. The `0.2.0-seal.0` package is **unpublished QA only**, not a Seal lifecycle release. Foundations 1.0.1 remains separately scoped.
- The founder's owner **visual-direction** approval is explicitly limited to six experimental UI areas at commit `fc95c3e89c14341dc5b685b6bbe7424bdd93b4f8`; it is not approval of this candidate, accessibility, new browser support, consumer migration or deployment.
- Four candidate closed-state axe incomplete node occurrences, plus the wider experimental accessibility queue (30 checks/316 node occurrences), require retained review. Real assistive-technology announcements, composited transparency/overlap, supported browser/OS versions, operational limitations and explicit Seal lifecycle decision remain outstanding.

**Follow-up:** [Seal qualification ledger](SEAL_WEB_CANDIDATE_2026_10_29.md), [owner visual decision](QA_VISUAL_ACCEPTANCE_2026_11_01.md), [stabilization and exceptions](https://github.com/GoreeCloud/gc-ui/issues/78).
