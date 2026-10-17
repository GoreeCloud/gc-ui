# GC UI Native Host Milestone — QA (2026-10-17)

**Scope:** GoreeCloud/gc-ui only. **Maturity:** experimental alpha Android and Electron desktop host previews. Not store-ready, native accessibility certified or fully cross-platform.

## Implemented
- Version 1 allowlisted JSON bridge with action/payload validation, message size cap, request ID correlation, request timeout, concurrency cap and safe browser fallback.
- AndroidX WebKit asset loader for local GC UI pages under its restricted HTTPS origin, main-frame-only WebMessageListener, with no arbitrary JavaScript interface, file access, cleartext traffic, remote browsing or INTERNET permission.
- Android capabilities for current phone/tablet size class, supported UI-mode contrast signal, animation setting, low-power setting, native system-bar appearance and selection haptics.
- Android native parent viewport that applies status/navigation bar and cutout insets to actual WebView bounds; contrasting system-bar icons and matching light/dark background, with persisted native bar appearance at cold launch.
- Sandboxed Electron BrowserWindow and context-isolated preload with minimal messaging, no Node integration or webview, denied permission prompts, denied remote navigation/HTTP resources and main-frame-only IPC.
- Experience Studio host state and opt-in selection feedback control; other browser labs unchanged and fully usable without native APIs.
- Independently pinned Android Gradle wrapper and optional Electron package/lockfile, with TypeScript API declarations and instructions.

## Automated verification
- Core npm run check: **114/114 Node tests passed**, token generation consistent and **7,988 opaque semantic color-pair checks passed** across 722 schemes.
- Native contracts: **11/11 Node tests passed**, including malformed/bounded payloads, rejected arbitrary operations, correlated replies, timeouts, lifecycle and static host security gates.
- Full Chromium interaction suite: **50/50 passed**, including existing UI flows and both hosted/unhosted WebView-compatible message scenarios.
- npm pack dry-run: **117 package files, 21 required exports**; Android and Electron dependencies are not imported into the core web runtime.
- Electron smoke launched actual app under Xvfb, connected the desktop profile and successfully changed native appearance. Repeated runs correctly handle persistent theme state.
- Android Gradle 9.5, AGP 9.2.1, SDK 36 / target SDK 35, full JetBrains JDK 21: **assembleDebug PASS**. APK is approximately 1.6 MB. This is a development-signed debug APK, not a release artifact.

## Real Android device verification
A connected Android 16 / API 36 device was used with ADB. **APK installation and cold app launch passed.** The Experience Studio rendered in WebView, and the controls visibly showed:

- Platform profile automatically set to Phone.
- Native Android host connected.
- Selection feedback performed after pressing the native-feedback test control.
- Correct top and bottom system insets, without toolbar/status-bar overlap.
- Readable status-bar icons and matching background in both light and dark appearance.
- Two consecutive force-stop/cold-start runs preserved the dark native system-bar background (sampled RGB 16/19/30); the renderer also re-synchronizes its current mode on native handshake.

Screenshots were inspected locally. The captures are not stored publicly, contain hardware system chrome and are **not** approved visual-regression baselines. One initial WebView-padding approach did not inset content and was replaced with a native FrameLayout container; that final implementation was rebuilt and reverified on device.

## Not yet validated / release gates
- Manual TalkBack accessibility, screen-reader semantics of Android WebView, physical keyboard and back gestures, system animation settings across OS versions, foldables and landscape.
- Production signing, Android Play policy checks, crash reporting, permission review, safe-area testing on other device/API combinations, and GPU/battery measurements.
- Desktop Windows/macOS packaging and signing, updates, native menus, OS-integrated keyboard shortcuts, CSP review, and upgrading/revalidating Electron against a maintained security-patch line prior to distribution.
- Electron host's reduced-motion/high-contrast capability hints are intentionally minimal; browser CSS media queries still handle them. Actual OS services require platform-specific implementation and device QA.
- Neither host exposes arbitrary filesystem, shell, camera, geolocation or clipboard capabilities. Those require separate user-directed designs and security review if ever introduced.

**Release decision:** Host previews are suitable for continued GC UI development, not production distribution. Keep the core package private/alpha until release gates are satisfied.
