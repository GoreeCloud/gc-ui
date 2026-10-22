# GC UI Web API — 0.2.0-alpha.1

**Experimental; not published to npm; not a production-ready or WCAG-certified component library.** The GC UI design specification is broader than the coded component subset. This document defines the actual currently shipped source interfaces.

## Getting started from this repository
1. Clone `GoreeCloud/gc-ui` or download its source. No runtime dependencies or build tooling are required to view the labs.
2. Run `npm run dev`. Visit `http://localhost:4173/lab/components.html` to inspect live component behavior and `/lab/v1.html` for the foundation and custom seed demo.
3. Use the token sheet and component sheet together:
```html
<link rel="stylesheet" href="/styles/gc.v1.generated.css">
<link rel="stylesheet" href="/styles/gc.v1.components.css">
```
4. When serving from the cloned repository, import ES modules by relative path (bare package imports require a bundler or a locally installed package):
```js
import {createThemeController,initTabs,initMenu,createToast} from '/src/index.mjs';
const theme=createThemeController();
const cleanupTabs=initTabs(document.querySelector('[role="tablist"]'));
```
The package.json export map is **provisional** for local development and future distribution. The repository keeps `private:true` until release gates pass.

## Theme controller
```js
import {createThemeController} from '/src/index.mjs';
const theme=createThemeController();
theme.set({mode:'auto',accent:'lagoon',material:'translucent',contrast:'system'});
theme.set({accent:'custom',seed:'#3978D3'});
const current=theme.resolved();
console.log(current.mode,current.material,current.contrast);
theme.reset();
theme.destroy(); // when tearing down a host application
```
The runtime accepts `mode: auto|light|dark`, `accent: iris|lagoon|ember|moss|custom`, `material: solid|translucent`, `contrast: system|standard|high`, and opaque six-digit hex `seed`. Invalid values fall back to known defaults. The operating system's increased contrast, forced-colors or reduced-transparency settings override Lens effects, even with a conflicting persisted preference. **When high contrast is active, custom inline role overrides are suspended** so the dedicated verified high-contrast palette can take precedence; chosen seed and accent preference are retained for when standard contrast returns. Private-mode storage denial is handled as an in-memory session.

Custom seed generation uses an original OKLCH tonal mapping, not Google's HCT algorithm and not native wallpaper sampling. Only sampled opaque semantic foreground/background pairs are audited; dynamic backgrounds still require runtime contrast verification and solid Lens fallback.

## Reusable component behavior
**Tabs:** `initTabs(tablist,{rtl:false})` requires `role=tablist`, `role=tab` children with `aria-controls`, and matching `role=tabpanel` IDs. Arrow Left/Right cycle among enabled tabs, Home/End jump, focus and selected state remain synchronized. Panels use `hidden`. Dispose via `destroy()`; it returns borrowed `aria-selected`, tab stop attributes and panel visibility only where the controller's last values remain, preserves newer application-owned edits, unregisters handlers, and rejects later `select()` calls. This experimental behavior is not part of stable Foundations.

**Action menu:** `initMenu(button,menu,{onSelect})` requires a button, an ID'd element with `role=menu`, and children with `role=menuitem`, `menuitemcheckbox` or `menuitemradio`. Arrow Down/Up, Home/End, Enter/Space, Escape, and Tab are handled; disabled items are skipped, both native-disabled and `aria-disabled="true"` triggers refuse new openings while remaining focusable as the host intends, and outside pointer clicks dismiss. The callback receives the selected element/event. Menus execute commands; don't repurpose as a select or site navigation. See `#menus` in Components Lab.

**Dialogs:** `initDialog(nativeDialog)` binds buttons with `data-gc-dialog-open=dialog-id` and `data-gc-dialog-close`, using native `showModal()`, Escape and focus management. Buttons that open dialogs still need informative labels. Opening/closing is idempotent; dynamic onSelect behavior remains the app's responsibility.

**Toasts:** `createToast(region)` sets polite live-region semantics and creates plain-text messages. The `show()` return value dismisses only its own toast; stale callbacks cannot dismiss newer notifications. `duration:0` disables automatic timeout. For timed toasts, pointer hover and focus within the toast independently pause automatic dismissal; the timeout restarts only after both have left. Moving focus between descendants does not restart the timer. Calling `destroy()` removes the current message, clears its timeout and permanently retires that controller: subsequent `show()` calls throw, while repeated `dismiss()`, `destroy()`, and old dismissal handles are harmless. A new controller may reuse the region; region-level ARIA attributes are not removed by teardown. These messages are informational: essential information still needs a persistent source after a toast disappears, and live-region announcements require manual screen-reader review.

**Async actions:** `runAsyncAction(button,()=>promise)` rejects duplicate activations and native/ARIA-disabled triggers, sets aria-busy, and disables the button while pending. On success or failure it restores interactivity only when the host has **not** explicitly set `aria-disabled="true"` while pending; an application policy change must not be overwritten by async cleanup. It does not invent success messages; the caller must handle errors and status announcements.

## Styling contracts
All color uses `--gc-v1-color-<semantic-role>` variables, never a component-specific hardcoded RGB value. Space, typography, shape, motion, target size, and component geometry derive from `tokens/gc.v1.tokens.json`. Run `npm run tokens:build` after changing token source; `npm run tokens:check` catches CSS drift. Import the component sheet only where its classes are used, and prefer native HTML controls.

GC UI uses three planes: Canvas for the environment, opaque Surface for information, and bounded Lens for floating controls. `data-gc-material=solid`, `data-gc-contrast=high`, and forced-colors modes disable Lens transparency. Avoid nesting Lens over Lens or using it as the background for lengthy text.

## Reproducible verification
```sh
npm run check          # checks generated CSS, unit tests, color audit, local assets
npm run audit:colors   # 361 seeds in light+dark, plus high-contrast and curated schemes
```
Both the audit and tests are **opaque role checks**, not visual screenshots, screen-reader certification or a device lab. GitHub Actions runs the checks on pushes to main and pull requests; a local check or workflow definition does not prove a particular remote run passed.

## Known gaps
No bundled npm release, no complete 63-component implementation, no native SwiftUI/Compose/TV adapters, no full filled glyph set, no production wallpaper sampling, no comprehensive picture/video backdrop contrast testing, no full Playwright end-to-end matrix, no manual VoiceOver/NVDA/TalkBack audits. Production usage requires a dedicated accessibility and security review in the host application.

**Versioning:** this is v0.2.0-alpha.1, so APIs and visuals may change without compatibility guarantees. See `docs/RELEASE_PLAN_V1.md`.

## Machine-readable component registry
`registry/components.v1.json` is a complete 63-entry reflection of `docs/COMPONENT_CATALOG_V1.md`. Each pattern declares its documented anatomy and behavior, category, experimental or specification-only web maturity, and any source/example pointers. The [Component Registry Explorer](../lab/catalog.html) supports search and filters. `tests/component-registry.test.mjs` prevents undocumented status inflation and mismatches between the manifest and written catalog.

## Web component stylesheet completeness
Menu positioning and all three ARIA menu item variants (`menuitem`, `menuitemcheckbox`, `menuitemradio`) are styled by the exported `./css/components` entry, not only the laboratory stylesheet. Wrap a menu in `.gc-menu-anchor` for absolute positioning relative to its trigger; pair `.gc-menu` with `.gc-lens` only when material treatment is appropriate. Small buttons retain a minimum 44px block target height.

## Adaptive navigation and native side sheet (experimental)
The exported `./css/navigation` sheet styles `.gc-app-bar`, `.gc-nav-bottom` (compact viewports below 600 CSS px), `.gc-nav-rail` (600–1199), `.gc-nav-sidebar` (1200+), `.gc-breadcrumbs`, and `.gc-side-sheet`. The reference at `lab/adaptive.html` uses real links with `aria-current=page`, labeled navigation landmarks, and a native modal `<dialog>` controlled through `initDialog`. Route changes in this lab only update demonstration content and are not a general-purpose router.

The app bar and navigation CSS intentionally stay in a separate stylesheet so simple components don't require shell layout primitives. Screen reader, focus, contrast and viewport verification remains part of pre-stable release gating.

Full responsive shell, navigation accessibility, native modal and test requirements are in [Adaptive shell architecture](ADAPTIVE_SHELL.md).

## Component lifecycle stabilization
Native dialog controllers close any modal that is still open when destroyed, unregister listeners, and return focus to the original trigger where possible; calls to `open()` or `close()` after destruction throw. Tab groups reject duplicate tabpanel references and respect both native `disabled` and `aria-disabled="true"`, including changes made after initialization. The browser and Node suites cover these contracts.

## Experimental forms reference
The `./css/components` stylesheet includes `.gc-textarea`, `.gc-field-foot`, `.gc-search-input`, `.gc-search-suggestions`, `.gc-validation-summary`, and `.gc-empty-state`. Native controls handle editing and basic focus semantics; the keyboard suggestion controller and linked error summary live in `lab/forms.mjs` as demo code, **not** as an exported reusable JavaScript form controller. Applications must adapt the demo without claiming a framework-integrated component.

See [Forms and search interaction contract](FORMS_CONTRACT.md) for keyboard, failure, accessibility and privacy notes.

## Experimental native-first settings and recovery
The exported `./css/components` file now styles `.gc-passphrase-wrap`, `.gc-passphrase-reveal`, `.gc-native-select`, `.gc-stepper`, `.gc-stepper-button` and `.gc-recovery-error`. These complement the Forms Lab. Password reveal and bounded number-stepper behavior are now imported from the **experimental** package API, `initPasswordReveal` and `initNumberStepper`; native select updates and local simulated retry behavior remain in `lab/forms.mjs`. These APIs are not stable or published. The reference includes IME-aware search composition guards but still requires manual AT and multilingual keyboard testing. See [Forms contract](FORMS_CONTRACT.md).

## Experimental native form controllers (source API)

```js
import {initPasswordReveal,initNumberStepper} from '/src/index.mjs';

const secret=initPasswordReveal(
  document.querySelector('#demo-passphrase'),
  document.querySelector('#passphrase-reveal')
);
const count=initNumberStepper(
  document.querySelector('#demo-collaborators'),
  document.querySelector('#demo-decrease'),
  document.querySelector('#demo-increase'),
  {onChange(value){ console.log('Example count:',value); }}
);

// Unmounting an example:
count.destroy();
secret.destroy(); // also re-masks a revealed input, without clearing its value
```

The reveal helper requires a native `type=password` input and a `type=button` control with a **stable accessible name** (`aria-label` or `aria-labelledby`). It toggles `aria-pressed` and the visible Show/Hide label; teardown restores password masking.

The number helper requires a native `type=number` input with finite integer `min`, `max`, and a positive integer `step` that divides the range. It clamps/rounds manual changes on blur or change, disables the increment/decrement buttons at endpoints, and returns focus to the input after a step-button activation. `get()`, `set(number)` and `destroy()` are available. Direct typing is not normalized on every keystroke. Invalid options throw rather than silently producing a broken range. The host owns the visible count message via `onChange`.

Both helpers have TypeScript signatures in `types/index.d.ts`, framework-neutral Node lifecycle tests, and browser specimens. **Experimental only**: these interfaces may change, have no production security certification, and do not make the remaining forms library stable.
