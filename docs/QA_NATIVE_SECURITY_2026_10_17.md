# GC UI Native Host Security Hardening — QA, 2026-10-17

**Repository:** GoreeCloud/gc-ui only. **Status:** experimental alpha security checkpoint, not a penetration test or production distribution approval.

## Changes tested
- Electron's file loader now has a canonicalized **public-file allowlist** (assets, lab, styles, src, registry, docs), bounded file extensions and strict rejection of hidden files, Git metadata, tests, native build material and symlink escapes.
- Electron serves bundled files with a restrictive Content Security Policy: no network connections, no embedded frames, no object content, no inline scripts, and no outside scripts or CSS. The browser window remains sandboxed and context-isolated.
- The shared host client rejects unknown fields in appearance requests and mismatched host/platform combinations; optional host capability signals must be booleans, never arbitrary truthy values.
- Android's WebView interceptor now explicitly accepts only the synthetic HTTPS app-assets origin/path. Nonlocal or missing resources produce a 403 empty response; main-frame message origin restrictions remain.
- GitHub Actions [native host workflow](../.github/workflows/native-hosts.yml) adds a fast Node host-contract job and a JDK 21/SDK 36 Android debug build job. The hosted native workflow passed its contract and Android build jobs in GitHub run 39048308957, following the SDK provisioning fix.

## Local validation evidence
- Core check: **115/115 Node tests passed**, token generation and package export checks passed, and **7,988/7,988 opaque semantic color pairs passed** across 722 schemes. These are not composited rendering audits.
- Native contract suite: **14/14 tests passed**, including deny-by-default file policy, symlink escapes, malformed/oversized frames, request timeouts, invalid capability flags and host mismatch cases.
- Full Chromium interaction suite: **50/50 passed** across existing UI flows and the native-host mock integration.
- Actual sandboxed Electron preview launched under Xvfb with local file allowlist/CSP applied; verified desktop profile and appearance control.
- Android Gradle debug build: **PASS** using installed full JDK 21 and Android SDK 36. APK was installed and cold-launched on a connected Android API 36 phone. Its locally bundled Studio rendered and displayed the verified native Android Phone-profile connection.
- Screenshots from the real device were reviewed locally for visible navigation, materials and native-host status. They were not committed and are not approved visual regression baselines.

## Open gates
- No hostile-origin penetration test of the running Android WebMessage listener has been conducted; current negative cases are source/static validations plus ordinary device operation.
- Hosted Android build and host contract jobs passed after provisioning was corrected; continue monitoring SDK compatibility on future runner images.
- Electron is upgraded to 44.9.0; continued patching, CSP violation telemetry, release packaging, code signing, and macOS/Windows testing remain open. Electron is pinned independently in the optional host, not core GC UI.
- Android Play/signing review, native accessibility, safe area across device families, orientation, long-running memory/power usage, low-end GPU profiling and manual TalkBack review remain open.
- Do not report a production security certification from these automated checks.

**Release decision:** Native hosts remain private experimental previews. The tightened bridge and resource restrictions are suitable for continued prototype development within GC UI.

## Hosted CI follow-up
The first native workflow run confirmed native-contracts PASS but Android setup failed before compilation because android-actions/setup-android@v3 invoked sdkmanager for the obsolete Android SDK package named tools (GitHub run 39048091259). The workflow was revised to use the command-line tools already present on the GitHub-hosted Ubuntu runner and install only platform 36 and build-tools 36.0.0. Hosted follow-up run 39048308957 PASSED both contract and Android debug-build jobs; later run 39048783630 PASSED all three native jobs including Electron desktop smoke. Local APK build and device launch remain separate evidence.
