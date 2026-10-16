# GC UI laptop + Android QA checkpoint — 2026-10-16

**Scope:** GC UI only, repository `GoreeCloud/gc-ui`, `main` branch. This checkpoint documents observed results, not a compliance certification or an assertion that later GitHub Actions runs passed.

## Observed test environment

- Authorized personal Linux laptop, Ubuntu 22.04, Node.js 24.19.0; local checkout `~/gc-ui`.
- Browser automation: locally installed Playwright 1.64.1, Chromium and Firefox.
- USB Android device: OnePlus N200 (`DE2117`), Android 16, ADB device authorized.
- Android browser: Firefox, displaying the GC UI adaptive lab through `adb reverse tcp:4173 tcp:4173`. A phone screenshot showed the compact app bar, heading, cards and three-item bottom navigation rendered within the device viewport.

## Test results

| Stage | Command | Observed result |
|---|---|---|
| Core tests and token integrity | `npm run check` | **57 passed, 0 failed**; CSS current, all four labs' local assets/SVG symbols resolved |
| Opaque semantic color audit | Included in `npm run check` | **7,988** pair checks over **722** generated schemes, zero failures; not a composite visual audit |
| Chromium UI interactions | `npm run test:e2e:interaction` | **17 passed, 0 failed**, after visual capture isolation |
| Chromium screenshots | `npm run test:e2e:visual` | **8 passed, 0 failed**; screenshot files captured as Playwright report attachments, not visually certified |
| Firefox UI interactions | `playwright test e2e/gc-ui.spec.mjs e2e/adaptive.spec.mjs --browser firefox --workers=2` | **17 passed, 0 failed** |
| Physical Android Firefox | USB debugging, ADB port reversal and page open | **Initial viewport visually verified only**; no claim of interaction automation, touch coverage, keyboard, assistive tech, or screenshot approval |

The initial combined Chromium browser run had **17 passes and 2 timeouts** while a combined multi-viewport screenshot capture competed with interaction tests. Direct reproduction showed high contrast remained active through appearance and palette changes; the isolated high-contrast case passed on its own. Splitting the eight full-page captures into their own single-worker stage led to a **fully passing second run: 17 + 8**. This is a test-execution isolation change, not evidence of a theme-runtime production defect.

## Coverage not yet established

- Android Firefox end-to-end clicks, modal focus/return, TalkBack, pinch/zoom, rotation, virtual keyboard, safe areas across devices, or slow-network behavior.
- Human visual approval of Playwright screenshots.
- Other devices, browsers, RTL, translated labels, TV remote control and native application shells.
- Live npm release suitability, security audit, or WCAG certification.

**Evidence handling:** local Playwright traces and phone screenshots are not copied into the public repository, avoiding publication of device/session artifacts. Retain or share approved GC UI-only screenshots separately if needed.

## Repeat locally

```bash
cd ~/gc-ui
npm run check
npm run test:e2e
npm run test:e2e:firefox
```

For physical Android Firefox, serve the checkout locally, reverse the server port with ADB, and open `http://127.0.0.1:4173/lab/adaptive.html` on the device. Keep the device unlocked and use the browser only with the device owner's consent.
