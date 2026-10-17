# GC UI — Android and Desktop Native Host Previews

**Status:** Experimental alpha. These are optional host projects inside GoreeCloud/gc-ui. The core web design system has no Android or Electron runtime dependency. A functioning preview is not production certification.

## Shared bridge

The [GC Native Host client](../src/gc-native-host.mjs) implements protocol v1, bounded JSON messages and three allowlisted actions:

| Action | Android | Electron | Side effects |
|---|---|---|---|
| getCapabilities | available | available | Platform profile and known accessibility hints |
| setAppearance | available | available | System bar appearance / Electron native theme |
| selectionFeedback | haptic via Android view | reports unavailable | Optional selection haptic |

Messages have validated IDs, size limits, request timeouts, concurrency limits and response correlation. Unknown actions or unsafe payloads fail closed. The bridge cannot execute shell commands, access arbitrary files, open remote links, obtain location, or access the clipboard.

The [Experience Studio](../lab/experience-studio.html) connects when either native transport is injected and remains fully usable without a host. Once a verified host responds, the platform design profile is set to the native profile; users can still manually preview other profiles in the Studio.

## Android WebView host

The [Android project](../native/android) is a Java/Android Gradle application targeting SDK 35 and compiling with SDK 36 and AndroidX WebKit.

- Loads a LOCAL copy of the Experience Studio under the synthetic HTTPS asset-loader origin: https://appassets.androidplatform.net/assets/lab/experience-studio.html.
- Gradle preBuild invokes [sync-web-assets.mjs](../native/android/scripts/sync-web-assets.mjs) to copy public assets, styles, JavaScript, docs and labs from the repo; generated APK assets are ignored in Git.
- The WebMessageListener is injected only into the trusted asset origin. Incoming frames are required to come from the main frame and exactly the allowlisted origin.
- The app applies system-bar/cutout insets to the WebView on modern Android and disables arbitrary file/content access, mixed content, cleartext traffic and WebView debugging. It contains no insecure addJavascriptInterface fallback and requests no INTERNET permission.
- Android capabilities use native UiModeManager contrast when supported (API 34+, with WebView CSS preferences as the older-device fallback), ValueAnimator animation enabled status, PowerManager low-power mode and resource configuration size.
- Selection haptic and system-bar appearance changes require explicit validated actions. The Android host stores only a local appearance-mode preference so system bars reopen with correct icon contrast; the renderer re-synchronizes its persisted theme after handshake. Haptics are optional feedback, not sole indicators.

### Android build commands

Requires a full JDK with javac (JDK 21 used in validation), Android SDK platform 36 and build-tools 36.

    cd native/android
    export JAVA_HOME=/absolute/path/to/full-jdk
    export ANDROID_HOME=/absolute/path/to/android-sdk
    ./gradlew :app:assembleDebug
    adb install -r app/build/outputs/apk/debug/app-debug.apk
    adb shell am start -n com.goreecloud.gcui.preview/.GCNativeActivity

This is a debug preview with development signing. Store-ready signing, app resource shrinking, host instrumentation, edge-to-edge system bars, orientation and accessibility testing remain separate release requirements.

## Desktop Electron host

The [Electron host](../native/desktop) runs the same Studio as a local file in a sandboxed BrowserWindow. The [preload](../native/desktop/preload.cjs) only exposes message sending/subscription. IPC accepts messages only from that window's main frame.

- Context isolation, sandbox and web security are enabled; Node integration and webview tag are disabled.
- Remote navigation, new windows, OS permission prompts, and HTTP(S) resource requests are denied.
- Trusted bundled GC UI repo resources may be read. No remote assets, arbitrary file reads, shell execution or OS command invocation is exposed.
- The desktop host can set native window appearance; selection haptics are unavailable.

### Desktop build and test

    cd native/desktop
    npm ci
    npm start

On Linux, with Xvfb installed:

    cd ../..
    npm run qa:native:desktop

The optional host uses its own lockfile. Core GC UI builds and browser labs are independent of Electron installation.

## Testing

    npm run check
    npm run test:native:contracts
    npx playwright test e2e/native-host.spec.mjs e2e/experience-studio.spec.mjs

Separate Android compile, APK installation and real-device launch from source-level policy tests. Separate Electron smoke tests from browser mocks. The [native QA report](QA_NATIVE_HOSTS_2026_10_17.md) records the evidence for this milestone.

## Remaining release gates

Manual TalkBack/VoiceOver and keyboard testing, navigation/back gestures, Android WebView behavior across API levels, screen cutouts/safe areas, native haptic preferences, system appearance and contrast, power/GPU profiling, and native installers/signed release builds require review. Desktop app packaging, CSP-hardening, native menus, macOS/Windows and notarization are not claimed complete.

## Hardening verification (follow-up)
The Android request interceptor now restricts both navigation and subresource requests to the synthetic HTTPS app-assets origin and its assets path; missing and nonlocal requests produce a 403 empty response, even without relying on the absent INTERNET permission. The Electron host uses a canonicalized allowlist of public asset directories and file extensions, rejects symlink escapes and repository metadata, and adds a restrictive Content Security Policy on local resources. Host capability claims are checked against the expected Android-phone/tablet versus Electron-desktop combinations and strictly boolean preference flags. See [the native security QA report](QA_NATIVE_SECURITY_2026_10_17.md).

## Electron runtime maintenance
The optional desktop preview is pinned to stable Electron 44.9.0 (October 17, 2026), with the runtime version asserted by its real-launch smoke test. A dedicated GitHub Actions desktop-native job runs the pinned Electron build under Xvfb. See [Electron runtime QA](QA_DESKTOP_ELECTRON_2026_10_17.md) for evidence and remaining cross-platform gates.

## Native accessibility and lifecycle adaptation (2026-10-17)
The Experience Studio merges browser accessibility media queries and **validated** host capability hints conservatively: if either requests high contrast, reduced motion, reduced transparency or low-power treatment, the restrictive behavior wins. A native power-saver hint reduces semantic elevation to E0, disables ornamental environment washes/shadows and opts out of choreography without changing text, focus order, controls or semantic colors. Native high contrast and transparency restrictions likewise suppress decorative effects; browser forced-colors remains authoritative.

The Studio refreshes its host capabilities on a visible window focus or visibility restoration, coalescing concurrent refreshes and cancelling motion when required. A malformed or unavailable host refresh disables native feedback and leaves the browser preview usable. Manual platform-profile previews are preserved while real device restrictions remain effective.

Android forwards activity pause/resume to its WebView, restoring its saved system-bar treatment when resumed. The source includes an optional Playwright server port override, GC_PLAYWRIGHT_PORT, so isolated worktrees do not silently test an older server running on the default 4173 port. For device and test evidence see [Native Lifecycle QA](QA_NATIVE_LIFECYCLE_2026_10_17.md). This is not certification of power savings or screen-reader usability.
