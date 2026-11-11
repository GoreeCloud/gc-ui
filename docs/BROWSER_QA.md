# GoreeCloud UI — Browser rendering and interaction evidence

**Status:** automated smoke coverage, not full browser or human acceptance.

## Command

Run `npm run browser:smoke` in a system with Google Chrome or Chromium available on PATH. The test starts a loopback-only, read-only HTTP server serving this repository's static source, then launches Chrome in isolated temporary profiles. It installs no packages and accesses no production services.

## Tested by the smoke workflow

- Explicit light/Iris and dark/Moss token resolution in Chromium.
- Actual computed CSS for the canvas, button minimum height, card radius and Lens surface.
- Custom icon element's rendered shadow DOM.
- Browser keyboard tab navigation and panel toggling.
- Native details exclusivity, pressed-button arrow selection, slider/output behavior and native dialog open/close.
- Automated PNG capture of the actual design lab at 1440×900 light appearance and 390×844 forced-dark appearance.

CI uses the pinned Ubuntu 24.04 runner because it includes Chrome/Chromium; runner-image drift and browser changes are possible. It records screenshots as a seven-day GitHub Actions artifact without publishing a website or accessing real accounts.

## Evidence and limitations

All interaction checks must pass before the browser job is green. The PNG files prove that a headless browser produced images of the current lab; their existence alone does not prove the layout is visually excellent, that there are no occlusions, or that components are accessible. Screenshot-led human review should check hierarchy, spacing, contrast over glass, controls, mobile reach, text scaling, keyboard, RTL, reduced motion, forced colors, real assistive technologies and platform-specific behavior. No native Android, iOS, Windows or Linux SDK is implied by this browser smoke.

Browser failures should be reproduced with the same source SHA and a Chrome version identified in Actions logs before remediation. Clean up only the isolated temporary QA directories, not production data.

## Responsive overflow regression gate

The browser suite also loads the **complete** design lab inside a same-origin viewport test frame at 320, 390, 600, 900, and 1440px requested window sizes. It fails if the document's scroll width exceeds its measured layout viewport, or if the narrow theme selector grid and control bounds are incorrect. A 320px screenshot is captured alongside the existing desktop and dark-mobile screenshots. Decorative scenes are clipped **within their own art container**, rather than hiding overflow on the application document and potentially masking unusable UI.

### Exact mobile emulation requirement

Headless Chromium may silently clamp a requested `--window-size=320,760` or `390,844` to a **500px CSS viewport** while writing a cropped 320px/390px PNG. This can create misleading horizontal scrollbars and falsely green responsive checks. The browser runner now uses the Chrome DevTools Protocol `Emulation.setDeviceMetricsOverride`, asserts `window.innerWidth` equals the requested width, and checks the PNG IHDR pixel dimensions. It tests **real 320px and 390px CSS layouts**. A CI pass without verifying those dimensions must not be represented as mobile acceptance.

## Complete curated appearance matrix

Chromium CI now switches the actual design lab through **all four accents × light/dark appearance** (eight combinations), comparing computed brand and surface variables against the canonical JSON values at a true 390px CSS viewport. Each combination must remain free of horizontal overflow and produces a separate mobile PNG in the seven-day workflow artifact. A separate Chrome pass exercises reduced-motion CSS tokens and the increased-contrast solid Lens fallback. These checks support screenshot-led review but do not replace human visual acceptance, physical devices, OS-native component testing, color vision screening, translated RTL, or manual assistive technology.


## Additional Chromium accessibility and localization gates

The browser acceptance runner also checks the actual full lab in RTL at 390px and 900px CSS layout widths, including right-to-left hierarchical tree arrow navigation and no horizontal page scrolling. It checks **simulated CSS root font-size** at 200% on mobile and 300% on desktop, plus a longer sample tree label and document reflow. This is **not a substitute for real browser zoom** or platform text scaling.

Forced-colors emulation verifies the Chromium media query activates, tree boundaries remain visible at the computed-style level, and mobile content does not exceed the viewport. It saves separate RTL, enlarged-text and forced-colors screenshots as short-lived GitHub Actions artifacts. These are automated smoke checks only: manual high-contrast, screen-reader, 400% zoom, localization, color-vision, physical-device and native SDK acceptance remain open.

### Enlarged text layout remediation

The 200% CSS-root-text smoke gate initially exposed a 103px horizontal overflow on a 390px mobile viewport. Browser diagnostics traced the root overflow to three white-space-nowrap hero action buttons expanding to widths of 385px, 397px and 477px. The showcase now stacks and wraps those buttons within its grid on narrow screens while keeping interactive controls visible; it does not hide horizontal page overflow to mask the defect. Source-level button behavior remains unchanged for consumer apps.


## Signature composition verification

The browser job verifies the reusable signature surface and feature tile, including a semantic layered backdrop, solid legible content, radius, elevation and viewport reflow. It saves dedicated light desktop and dark mobile screenshots focused on the signature components. Visual quality still requires human review of the actual screenshots, real interactions, assistive technology and performance. These tests enforce implementation invariants, **not** subjective beauty or certification.

## Rounded-window geometry

The full lab is checked in actual Chromium at 320, 390, 900 and 1440 CSS widths for four positive corner radii and horizontal reflow. The native browser dialog/drawer fixture is also checked for all four corner radii. These checks only verify the rendered web window contract; OS-level window manager acceptance remains unverified.
