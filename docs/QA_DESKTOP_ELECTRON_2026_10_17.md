# GC UI Electron Runtime Refresh — QA (2026-10-17)

**Scope:** GoreeCloud/gc-ui only; optional native/desktop host. **Status:** experimental alpha, not a packaged production desktop release.

## Upgrade
The optional Electron desktop preview is upgraded from pinned **35.1.5** to pinned **44.9.0**, identified by npm dist-tags as the stable latest release on 2026-10-17. Its separate package-lock.json pins exact dependencies, and the GC UI web core does not acquire Electron as a dependency.

## Verified locally
- npm install completed for Electron 44.9.0.
- Real Electron app launched under a Linux virtual display using the GC UI Experience Studio. Sandbox, context isolation, local resource allowlist, native host profile/bridge, and appearance toggling remained functional.
- The desktop smoke test checks the **actual Electron runtime version** against the exact version declared in the optional desktop package. Result: Electron 44.9.0, native desktop profile, native appearance toggle PASS.
- npm audit against the desktop dependency set returned **0 known vulnerabilities** (at the time of the local audit; not proof of future absence).
- GC UI core checks: 115 Node tests passed and package exports/token generation validated. Native host contract checks: 14 tests passed.
- Three native CI jobs now exist: protocol/policy contracts, Android debug build, and pinned Linux Electron launch. The new Electron hosted job must be verified via GitHub Actions; a locally parsed workflow is not a passing hosted run.

## Remaining release gates
Electron security maintenance continues as new stable releases are issued. Existing desktop limitations remain: unsigned debug host, missing installers and automatic update policy, no Windows or macOS device testing, incomplete native accessibility/assistive technology review, no screenshot pixel baselines or hostile-origin penetration testing, and no production deployment permission.

The runtime refresh improves the experimental host's maintenance posture but does not certify the entire design system or grant permission to deploy it as a production operating system shell.
