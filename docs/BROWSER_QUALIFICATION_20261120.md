# GoreeCloud UI — browser qualification matrix (November 20, 2026)

**This is a test evidence register, not a supported-browser version policy or certification.**
Tested source: protected `gc-ui` main `42965f8682c22973b4247d58238e68aa63d86523` plus proposed shortcut-label contrast fix from this PR. The live lab is a read-only development fixture, not an integrated consumer app or production deployment.

| Browser/engine | Actual environment | Scope executed | Disposition |
| --- | --- | --- | --- |
| Chromium headless | Linux x86_64, local cached Chromium revision 1255 | Full `npm run browser:smoke` with actual Chrome zoom 200–400%, color, RTL, contrast, interaction, reflow and shortcut foreground regression | PASS for tested runner/source only |
| Firefox (Playwright) | Linux x86_64, installed Firefox executable revision 1572 | Real rendered lab at 900px light Iris, 390px dark Lagoon/reduced motion, 320px light Moss; native focus, selector changes, navigation, planned form, dismiss toast | 3/3 PASS |
| WebKit (Playwright) | Linux x86_64, installed WebKit executable revision 2388 | Same real rendered lab matrix | 3/3 PASS |
| Chrome for Android | Physical OnePlus N200, Android 16, Chrome `157.0.8103.78` | Local lab loaded via explicit read-only ADB reverse tunnel; physical screenshot inspected; shortcut legend defect found and retested after fix | Targeted PASS |
| Firefox for Android | Same physical Android phone, Firefox `160.0.1` | Local lab loaded, Android accessible UI nodes visible; target button found and ADB-injected tap sent, but final destination state not independently established | Partial; destination NOT VERIFIED |
| Official Safari | No actual macOS or iOS Safari target verified | Not run; Linux WebKit is **not** macOS/iOS Safari | NOT VERIFIED |
| Other versions/devices | Older Chrome/Firefox/WebKit, diverse OS/GPU/AT and assistive tech | Not run | NOT VERIFIED |

**Important evidence limits:** a headless Playwright Firefox/WebKit run is real engine execution but not official release-version compatibility across all supported OSes. A phone screenshot demonstrates only visible pixels in that state. Normal CSS viewport reflow is not the same as true browser zoom. A successful static source lab is not evidence of authenticated consumer routes, network failures, upgrades, clipboard, downloads, permissions or content security policy.

## Proposed qualification exit criteria (still open)

For each explicitly supported browser/OS version, record the exact installed version and build channel, target device, source commit, viewport, magnification, appearance/contrast settings, actual critical workflow, keyboard/touch and AT results, screenshot and defect disposition. Include long translated labels, 200/400% true zoom, appearance/accent independence, forced/high contrast, reduced motion/transparency, native form validation, loading/offline/error states, focus restoration, navigation and dismiss controls, safe-area handling, and security/privacy expectations. Verify a first-party consumer, not just `lab/`.

**Priority gaps:** Official Apple Safari device, practical Firefox 200–400% browser zoom, real TalkBack/Orca/NVDA and VoiceOver, physical browser dock-swipe end-state, actual Notebook editor and at least one additional consumer's primary workflow. Do not report global support until each declared version/platform has acceptable evidence and a founder-approved scope.

The main browser fixture and optional cross-engine script remain read-only; tests run without production accounts and leave branch protection/release controls unchanged.
