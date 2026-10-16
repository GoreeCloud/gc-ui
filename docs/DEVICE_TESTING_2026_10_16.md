# GC UI — Laptop and physical Android device verification

**Date:** 2026-10-16  
**Target:** `GoreeCloud/gc-ui` at `0.2.0-alpha.1`  
**Status:** Repeatable automated checks passed locally; limited hands-on Android Firefox interaction verified; manual multi-device accessibility and visual signoff remain open.

## Test environment

- **Laptop:** Linux, Node.js 24.19.0, Python 3.10, Git and Android Debug Bridge installed.
- **Physical device:** OnePlus N200 (DE2117), Android 16, Firefox for Android, ADB authorized over USB.
- **Transport:** `adb reverse tcp:4173 tcp:4173`, local static server bound to `127.0.0.1:4173`.
- **Preview:** `http://127.0.0.1:4173/lab/adaptive.html`; no public network exposure was required.
- **Source:** only the public `GoreeCloud/gc-ui` repository was cloned and modified. Device serial and personal machine account paths are intentionally excluded from this public report.

## Local source validation — PASS

Executed `npm run check` against current `main` after a test-contract correction.

- **55 of 55** Node tests passing.
- Generated token CSS matches committed output.
- Seeded semantic color audit: **722 schemes, 7,988 foreground/background checks, zero failures** (opaque values only).
- Local asset and SVG symbol integrity: all **four** labs passed.
- Local working tree clean following test run.

The initial source run had 54/55 passing because a TypeScript contract test mistakenly required `function runAsyncAction(`, while the API correctly declares generic `function runAsyncAction<T>(`. The test now accepts valid generic function declarations. No public API behavior was changed.

## Browser automation — PASS

Installed the pinned `@playwright/test@1.64.1` runner and compatible Chromium on the laptop. The complete `npm run test:e2e` suite finished with **19/19 passing** in approximately 13 seconds: **17 interaction smoke scenarios + 2 visual evidence scenarios**.

Covered:
- Mobile, tablet, and desktop adaptive layout changes and active navigation.
- Route persistence on viewport resize and route announcement/focus.
- Modal side sheet with browser Escape and focus restoration in Chromium.
- Theme persistence and high-contrast color/material precedence across labs.
- Native and custom controls including tabs, command menus, sliders and disclosure.
- Narrow mobile viewport overflow.
- Eight screenshot captures as evidence; **no approved visual baseline** or human pixel-review signoff.

The first browser attempt produced **14 passed / 5 timed-out tests** because the automation attempted to click a visually hidden switch `input` directly. The visible switch track intercepted those synthetic clicks. The tests were corrected to click the containing visible `<label>`, matching normal pointer interaction, and all 19 cases passed on rerun. This fix was to the test procedure, not the user-facing control implementation.

Playwright noted that its Linux browser installer used a compatible Ubuntu fallback build; successful tests still do not constitute cross-browser certification.

## Physical Android Firefox — verified observations

1. **PASS:** `adb devices -l` reported the physical device as authorized (`device`).
2. **PASS:** Firefox launched the adaptive shell over the ADB USB tunnel. The server returned `HTTP 200` for the page and every requested shared token, component, navigation, lab, theme, interaction and color-engine asset.
3. **PASS:** Android UI accessibility hierarchy exposed the compact navigation destinations **Overview**, **Activity** and **Library**.
4. **PASS:** Tapping the **Details** button displayed the native side sheet, including **Designed to adapt.**, **Close details**, **Three navigation modes**, **Accessible structure**, and **Done**, all detectable in the accessibility hierarchy.
5. **PASS:** Tapping **Done** dismissed the side sheet.
6. **PASS:** Tapping compact **Activity** navigation updated the browser document title to **GC UI · Activity** and content to **Your activity.**
7. **OPEN — compatibility observation:** A single Android system **Back** key event did *not* dismiss the side sheet in Firefox. This is not proof of an application defect until reproduced with explicit browser/OS focus state and on other Firefox and Chromium Android versions. The on-screen Done action worked.

## Follow-up acceptance gates

- Recheck Firefox Android modal Back-key mapping, foreground focus, and browser UI handling. Preserve a visible dismiss action even when hardware Back cannot be relied upon.
- Inspect the eight Chromium screenshot attachments, plus real-device imagery, for hierarchy, truncated labels, bottom insets, keyboard occlusion, and visual material quality.
- Run VoiceOver, TalkBack, NVDA, keyboard-only, 200%/400% zoom, RTL, reduced-motion, forced-color and actual screen-reader announcements.
- Verify on multiple Android browsers and iOS Safari before raising the release status.
- Obtain a completed remote GitHub Actions result for the current commit; successful laptop tests are valid local evidence but not proof of CI success.

## Reproduction

From a clean checkout:

```sh
npm run check
npm install --no-save --no-package-lock @playwright/test@1.64.1
npx playwright install chromium
npm run test:e2e
```

For a USB preview, in another terminal start `python3 -m http.server 4173 --bind 127.0.0.1` from the repository root, run `adb reverse tcp:4173 tcp:4173`, and open `http://127.0.0.1:4173/lab/adaptive.html` in a browser on the connected Android device. The USB reverse mapping must be recreated after a device reconnection.
