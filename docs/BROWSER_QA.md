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
