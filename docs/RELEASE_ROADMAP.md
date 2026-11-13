# GoreeCloud UI — Stable release roadmap

**Decision (founder direction, 2026-11-13):** Deliver a **narrow, verified GoreeCloud UI 1.0.0 Stable web foundation first**, then release independently validated improvements and optional platforms incrementally as **1.1.0, 1.2.0, 1.3.0, …**. A minor release is additive and backward-compatible; defects may be corrected in patch releases, and breaking Stable contracts require a new major version with migration guidance.

**Draft candidate branch:** `1.0.0` here is version metadata for exact offline tarball tests, NOT a tagged, signed or published Stable release. Current GitHub CI validates alpha source, an offline installable tarball, and a local Chromium lab. The current root package entry point exports more than the proposed narrow foundation. Its compatibility boundary must be audited and documented before tagging 1.0.0. Machine-readable scope and fail-closed checks live in [release-plan.v1.json](../registry/release-plan.v1.json).

## Planned scope by release

| Target | Stable deliverable if its own gates pass | Explicitly not inferred |
| --- | --- | --- |
| **1.0.0** | Web foundations: semantic tokens, CSS Canvas/Surface/Lens materials, independent theme/appearance configuration, core patterns and icons, package integrity, frozen API subset and verified browser support | No native SDKs, consumer-wide adoption, backend security services, or blanket accessibility certification |
| **1.1.0** | Expanded and independently tested web interaction controllers plus consumer integration recipes and early verified web pilots | No automatic migration of unrelated products |
| **1.2.0** | *Candidate:* first working, compiled and runtime-verified native adapter, e.g. Android Compose, while maintaining the Stable web contract | Generated Kotlin/XML tokens alone are not an Android SDK |
| **1.3.0** | *Candidate:* verified Windows WinUI and/or Linux GTK4/Qt native adapter capabilities | A Windows or Linux UI token file is not an installable OS component |
| **1.4.0** | *Candidate:* verified SwiftUI iOS/macOS adapter capabilities and additional consumer integrations | Apple support requires its own toolchain, device and release evidence |
| **1.5.0+** | Additional prioritized consumer migrations, platform parity and design system capabilities, gated separately | No date, automatic platform certification or universal Stable claim |

Targets after 1.0 are **sequencing candidates**, not commitments to unverified features or a compulsory OS order. If a native track fails its gate, defer *that* track rather than hold back independently tested improvements or overstate the release. Any new supported native OS must satisfy the governing OS deliverable and acceptance rules. Consumer apps independently remain alpha/preview until their own releases.

## The 1.0.0 web foundation contract

The proposed frozen direct exports are `./foundation`, `./tokens`, `./tokens.css`, `./components.css`, `./glass.css`, `./icons`, `./icon-sprite`, `./icon-registry`, `./theme` and `./patterns`. These are **candidates only**, not currently Stable. The advanced `./commands`, `./menu`, `./table`, `./tree`, `./combobox`, `./bottom-nav`, `./navigation-rail` and `./signal-board` remain **preview until individually qualified**. The root `.` export currently re-exports both groups, so the pre-1.0 public-API audit must explicitly document each root symbol or introduce a compatible, clearly marked preview boundary. Do not silently remove or falsely call them Stable. All currently exported paths must remain represented in the registry classification.

**Color and appearance freedom is permanent:** GoreeCloud UI requires no global hue, default brand color, or mandatory light/dark appearance. Each authorized application can select an independent accessible accent, visual palette and supported appearance; the illustrative Iris/Lagoon/Ember/Moss presets do not impose a brand choice. Cloud Lens may use frosted glass selectively with solid, reduced-transparency and forced-color fallbacks.

## Release acceptance workflow

1. Resolve [machine-readable blocking gates](../registry/release-plan.v1.json) for a specific *candidate commit* and identify reproducible evidence for each. Use `npm run release:status` for a non-mutating readiness report. `npm run release:verify` must **fail closed** while any gate or the exact package version is outstanding.
2. Freeze and review the supported export/API and browser matrix. Run `npm run check`, `npm run browser:smoke`, `npm run verify:package`, visual/interaction acceptance, security/privacy/license review and downstream offline integration checks on the candidate. Automated Chromium and CSS-root-font checks are not actual browser zoom or real-device results.
3. Record an exact release SHA, verified assets and a rollback/upgrade plan. Verify GitHub branch protections or an authorized, documented alternative, and do not imply that passing CI alone makes a Stable release.
4. Only after the gates pass should the authorized maintainer set the Stable version, tag/publish the verified artifact and read back the release record. **No npm publication or GitHub release is authorized by this planning document alone.**
5. Continue the 1.1+ train with compatible additions and separately tested native platform or consumer integrations; distinguish web, native and product release maturity.

**Accessibility governance:** Under founder instructions §13.2.1, unfinished human assistive-technology checks and discretionary accessibility enhancements are advisory for this personal hobby project's internal Stable designation, **not independently blocking**. Actual platform requirements, functional reliability, user safety, privacy, and legal obligations still apply. Do not falsely claim WCAG certification, human screen-reader testing, real 400% browser-zoom verification or platform parity.

The shared UI defines presentation only: GoreeShield governs privacy, Wardveil cybersecurity, GoreeCloud Mesh service integration, and GoreeCloud Identity authentication/authorization. Neither 1.0 nor later component releases implements those other systems by itself.

### Fail-closed evidence integrity

The read-only `release:status` and `release:verify` checks independently require the exact eight mandatory gating IDs, keep each `blocking: true`, verify the alpha-versus-candidate version contract and root preview compatibility boundary, and require a clean Git working tree and an exact source SHA. Verified gates require nonempty, structured HTTPS evidence records whose recorded source SHA matches that exact revision. Rewriting a gate to nonblocking or deleting it cannot manufacture readiness. Evidence URLs and summaries are **metadata**, not proof that a reviewer opened them or that a test actually passed: the release engineer still must inspect underlying CI, screenshots, packaging and real-world findings. The command never tags, publishes, deploys or accepts a release by itself.
