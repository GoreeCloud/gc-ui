# GoreeCloud UI — real-device and human accessibility acceptance

**Status: technical smoke executed; human assistive-technology acceptance NOT EXECUTED.**
**Source tested:** protected main `42965f8682c22973b4247d58238e68aa63d86523` plus the scoped browser shortcut-label correction proposed in this review branch. Date: 2026-11-20.

## Actual device / trustworthy boundaries

- Target: **physical OnePlus N200 (DE2117)** USB-attached to authorized Linux laptop; Android **16 / API 36**, screen **1080 × 2400 px**, system-reported 450 dpi. No emulator claims here. Phone identifier, OS account details, personal notifications and private apps intentionally excluded from public evidence.
- Synthetic fixture: `samples/android-compose-integration/`, **Jetpack Compose Material 3 Expressive outer theme plus shared Compose Multiplatform UI**. Offline Gradle **9.5.0** debug build succeeded. APK 12,933,585 bytes, **SHA-256 `3f4113408d1640a98d85d1cf004e0a8dd91ff75d4accc0d65cec3dcf624b9fa3`**. Debug signature verified using Android APK Signature Scheme v2. Test APK version `0.0.0-dev`, Android minimum API 26 / target API 36. It is **not release-signed**.
- Manifest inspected: `android:allowBackup=false`, `android:usesCleartextTraffic=false`; no `INTERNET` or user-sensitive Android permission requested. Package merger exposes only an auto-generated package-scoped non-exported dynamic-receiver permission. No live accounts, endpoints or data.
- On **physical device**, installation and explicit foreground launch succeeded; Android accessibility hierarchy exposed the synthetic title, Compose action, disclaimer and local tap count. ADB-injected tap on the named action changed its displayed count **0 → 1**. A later snapshot shows **1**. No matching app crash appeared in the sampled error log. These were **automated input and accessibility-tree observations**, **not a human finger, TalkBack or screen-reader judgment**.
- Developer screenshot: [sanitized native phone fixture](evidence/physical-android-compose-20261120.png), cropped to exclude Android system surfaces. No personal/app data is included; merely visual evidence of the synthetic test screen. The screenshot does not establish native platform-wide design adoption.
- The actual phone also rendered the local read-only GoreeCloud UI **design lab** via an explicit, temporary ADB reverse tunnel; Android **Chrome 157.0.8103.78** and **Firefox 160.0.1** opened that lab. Firefox accessibility hierarchy exposed its actual labels and a clickable `Explore interaction` button; an injected tap was sent. Its resulting destination was **not independently proved** by the limited dump, so record action discovery/tap rather than end-to-end destination success.
- Human TalkBack was **disabled** at inspection time (`accessibility_enabled=0`); no accessibility service was changed by these tests. An actual Chrome screenshot revealed the `Ctrl K` shortcut label's inadequate foreground/background separation. Source CSS was corrected to `color:var(--gc-text)`; real Chrome phone re-capture shows legibility after fix. Chromium checks measure contrast **14.23:1 light** and **12.56:1 dark** on this actual CSS at 390px. Compare the [sanitized phone browser screenshot](evidence/physical-android-chrome-shortcut-20261120.png). These are **local visual and automated contrast checks**, not universal color/AT certification.

## Repeat only with explicit device authorization

Build and inspect the local debug fixture first; verify signed APK and allowed permissions, then install and start it **manually** on the consenting target phone. Use an isolated non-production test account/device where possible. The repository's **opt-in** command only examines the **already foreground synthetic** fixture; it does not choose a device, install/launch software, change accessibility settings, scan other apps, create screenshots, or access a network.

```sh
GC_ANDROID_DEVICE_SERIAL="<explicit-ADB-serial>" \
GC_PHYSICAL_TEST_ACK=synthetic-ui-only \
node scripts/physical-android-acceptance.mjs
```

The script refuses an unselected device, an emulator, a different app or unexpected package version. It saves temporary synthetic-only XML to the test phone and removes the copies on exit. **Do not run on a different user's device without informed consent.** It does not require privileged access. The local read-only browser lab can be served with `node scripts/phone-browser-qa-server.mjs` and an explicit temporary `adb reverse tcp:18745 tcp:18745`; remove the tunnel and stop the server after inspection.

## Human accessibility acceptance — pending operator session

Run these tests **as a person**, not by declaring success from source checks, screenshots or ADB. Record tester consent, specific device/OS/build, browser/screen-reader version, exact screen, task, observable feedback, defect severity and decision. Avoid retaining screen-reader speech containing personal account data.

1. **Android / TalkBack** (physical phone): With the fixture foreground and TalkBack enabled by the device owner, swipe through title, panel copy, `Count a tap`, current count and disclaimer; confirm intelligible spoken role/name/order, activate by double tap, and verify the updated count is announced or discoverable. Test system large text, dark appearance and rotation when safe. Restore the user's original accessibility preferences. Human result: **NOT TESTED**.
2. **Phone web / TalkBack in Chrome & Firefox**: Visit the locally served synthetic lab; navigate appearance/accent selectors, high-contrast/transparency toggles, hero controls, dock and disclosure/menu. Test touch exploration, named actions, focus trapping/restoration, status announcements, error/offline text and horizontal dock discoverability. Compare light/dark and system accessibility settings. Human result: **NOT TESTED**.
3. **Linux / Orca** on supported desktop browser: test meaningful landmark/headings/navigation sequence, form labels, expanded/pressed/current states, error feedback, dialog Escape and focus restoration, table/tree/combobox keyboard navigation and 200–400% zoom with labels intact. Orca exists on the authorized laptop; no verified human session has occurred. Human result: **NOT TESTED**.
4. **Windows / NVDA** and **macOS / VoiceOver / Safari** on authorized real target hardware: complete the same critical interactions and true browser zoom, noting unsupported targets. No Windows/macOS test device was verified in this session; results **NOT TESTED**.

**Human test record template:** Tester (private reference): ____ | consent: ____ | device/OS: ____ | assistive technology/version: ____ | source/version: ____ | scenarios: ____ | spoken results: ____ | findings: ____ | verdict (PASS / FAIL / NOT VERIFIED): ____ | date/time: ____ .

## Acceptance disposition

- Physical Android **synthetic Compose click and accessibility-node smoke: PASS** at the named APK and device only.
- Android Chrome/Firefox **physical lab load and target discovery: PASS**; Firefox tap end-state not independently verified.
- Mobile keyboard shortcut contrast **defect found, source corrected and Android Chrome re-render visually inspected**; exact branch CI pending at documentation time.
- Human screen-reader/switch access, native consumer workflows, broad Android hardware and iOS/Windows/macOS: **NOT VERIFIED**.
- Stable 1.0.0 cannot inherit any native app certification. This fixture belongs to **future native qualification**, independently from the narrowly scoped web Stable candidate.
