# GoreeCloud UI — extended isolated QA evidence

**Historical status (November 12, 2026):** Verified isolated QA evidence for the then-unmerged review branch; no deployment, native-device certification or founder design approval was established. **Subsequent November 13 source change:** [PR #75](https://github.com/GoreeCloud/gc-ui/pull/75) merged to public main after passing CI; this does not retroactively upgrade the November 12 review evidence or establish any release/deployment.

## Source and environment

- Repository: `GoreeCloud/gc-ui`, branch `docs/unified-atmospheric-glass-standard-20261112`
- Tested checkout HEAD: `728440f` (prior to subsequent documentation-only evidence commits)
- Authorized device: `personal-laptop-ideapad3-01`; disposable checkout `/tmp/gc-ui-review-K2LqeC/repo`
- Node `v24.19.0`, Git `2.43.0`
- Existing Chromium binary: `/home/slickkredd/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome`; no new browser installed
- Browser smoke invoked with `GC_CHROME_BIN` set to the existing executable; test's HTTP server binds loopback

## Verified results

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run check` | PASS | Exit 0; 155/155 Node unit tests; generated platform resources checked; 82/82 opaque contrast pairs |
| `npm run verify:package` | PASS | 67 packaged files verified through isolated offline consumer |
| `npm run browser:smoke` without browser path | BLOCKED | Launcher did not locate Chrome/Chromium via PATH |
| `GC_CHROME_BIN=... npm run browser:smoke` | PASS | Exit 0, runtime 19.24s; existing Chromium binary |
| Browser layout | PASS within suite | No horizontal overflow at 320, 390, 600, 900, 1440 CSS px |
| Live DOM | PASS within suite | 60 checks in light/iris desktop and 60 in dark/moss mobile |
| Themes | PASS within suite | Iris, Lagoon, Ember, Moss in light and dark |
| Accessibility modes | PASS within suite | Reduced motion, opaque high-contrast Lens fallback, forced colors, RTL, text scaling to 400%, accessibility tree |
| Navigation and controls | PASS within suite | Bottom dock, navigation rail, menu, combobox, command palette, table, tree, pending form |
| Screenshot capture | COMPLETED | Desktop/mobile captures reported; images not independently reviewed in this record |

The browser script also reported named navigation, four links, window heading, native dialog and buttons in desktop-light and mobile-dark accessibility trees. This is machine-observed structure, not a screen-reader user acceptance test.

## Scope limits and next gates

- Browser screenshot capture is not independent visual approval; review actual screenshots against approved design and on representative devices.
- Contrast checks for 82 solid pairs do not measure every dynamic translucent composite.
- Native desktop/mobile operating system behaviors, actual screen-reader workflows, GPU/battery performance and real privacy/security enforcement remain unverified.
- Founder hue-policy reconciliation, Drive publication, PR merge and production deployment remain open.
- No application code or canonical tokens were changed as part of this QA evidence.

**Reproduction:** In a disposable trusted checkout, run `npm run check`, `npm run verify:package`, then `GC_CHROME_BIN=/path/to/existing/chromium npm run browser:smoke`. Avoid assuming that a browser binary is in PATH. Review any generated files and the working-tree diff before committing.
