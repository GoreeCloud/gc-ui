# Real browser zoom — Chromium accessibility acceptance

**Scope:** GoreeCloud UI's local, synthetic design lab. This is browser-specific source and runtime verification, not a Stable 1.0 release certificate, multi-browser guarantee, physical-device test or assistive-technology signoff. Track remaining acceptance in [issue #28](https://github.com/GoreeCloud/gc-ui/issues/28) and [issue #7](https://github.com/GoreeCloud/gc-ui/issues/7).

## Why this differs from CSS root text scaling

The existing design-lab tests enlarge the root `font-size` to 200–400%; that is valuable but **does not simulate browser zoom**. The new Chromium test sends genuine **Ctrl + Plus** keyboard shortcuts through DevTools' native input dispatch. Chrome applies a per-origin browser zoom preference, increasing `devicePixelRatio` while reducing `window.innerWidth` in CSS pixels. `visualViewport.scale` stays at 1 (not pinch zoom), the computed root font stays at 16px (not CSS root scaling), and Ctrl + 0 resets zoom.

The test intentionally starts from a *larger physical viewport* so its zoomed CSS layout matches the narrow viewport being evaluated. It keeps device metrics/emulated media independent from the browser's actual zoom. A failed browser shortcut, unexpected zoom increment, non-reset browser state, page overflow or unreachable keyboard target fails the test.

## Automated Chromium matrix

| Test | Physical viewport | Actual browser zoom | Resulting CSS viewport | Display setting | Coverage |
| --- | --- | --- | --- | --- | --- |
| 200-mobile | 780px | 200% | 390px | Iris, light | Full page reflow, visible focus |
| 300-desktop | 2700px | 300% | 900px | Lagoon, light | Page/section reflow, desktop command focus |
| 400-dark-rtl | 1560px | 400% | 390px | Moss, dark, RTL, reduced motion | Page and sections, floating navigation keyboard reachability, real form input interaction, screenshots |
| 400-forced-compact | 1280px | 400% | 320px | Ember, forced colors | Page and sections, floating navigation keyboard reachability, real form input interaction, screenshots |

The browser smoke checks the lab's Foundations, Components, Patterns and Forms section boundaries, page-level horizontal overflow, relevant native keyboard focus and scroll reachability, selected canonical accents, and browser zoom reset. Overflow intentionally contained inside tables or scrollable navigation is not treated as forbidden document overflow.

Run locally from a verified checkout with Node 22+ and a trusted existing Chrome/Chromium binary:

```sh
GC_CHROME_BIN=/path/to/verified/chrome npm run browser:smoke
```

The job uses a temporary, read-only loopback source server and an ephemeral browser profile. It does not install browser binaries, access service accounts, store preferences, send telemetry or call production endpoints. Browser screenshots (when executed) are written to ignored `qa/screenshots/gc-ui-actual-browser-zoom-*.png` and uploaded by the configured CI only as bounded test evidence.

## Interpretation and open gates

**Automated pass** means the inspected Chromium revision handled the documented zoom viewport, theme, native focus and horizontal overflow checks. It is **not** a blanket WCAG 1.4.10 approval: other engines, long translated real-world content, interactive elements in every product route, full 400% browser zoom on Windows/macOS and physical mobile devices remain separately unverified. Screenshots support visual inspection only, and cannot establish genuine NVDA, VoiceOver, Orca or TalkBack results. Screen-reader, touch and founder acceptance gates remain open until independently demonstrated. Consumer apps do not inherit compliance merely by importing GoreeCloud UI.
