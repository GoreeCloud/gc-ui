# GC UI Adaptive Application Shell — Alpha Contract

**Release maturity:** experimental reference, not production-ready. The following contracts apply to `lab/adaptive.html`, `styles/gc.v1.navigation.css`, and `src/gc-interactions.mjs`. They do not supersede `docs/LAYOUT_PLATFORMS.md`.

## Intent

Keep the task and information architecture stable while adapting navigation chrome. The same three destinations—Overview, Activity, and Library—appear at all viewport sizes, and each has an explicit current-location marker. Do not treat a responsive shell as a router, a data layer, or a complete native adapter.

## Breakpoint behavior

| Viewport width | Active landmark | Layout contract |
|---|---|---|
| Below 600 CSS px | `.gc-nav-bottom` | Three equal destinations, touch targets at least 44px, bottom safe-area padding. No horizontal scrolling or horizontal menu rail. |
| 600–1199 CSS px | `.gc-nav-rail` | Persistent vertical navigation rail with glyphs and visible labels. Main content remains readable and accessible. |
| 1200 CSS px and above | `.gc-nav-sidebar` | Persistent sidebar with destination labels, grouped items, and optional supporting detail. |

`.gc-app-bar` stays visible across breakpoints. `.gc-breadcrumbs` conveys hierarchy without duplicating a back control. The CSS source of truth lives in `styles/gc.v1.navigation.css`, exported as `@goreecloud/gc-ui/css/navigation`.

At most one primary-navigation landmark is visually exposed at each breakpoint. All implementations use native anchors and `aria-current="page"` for the active destination. Accessibility APIs generally exclude CSS `display:none` regions; verify this in target screen readers.

## Route and focus contract

The reference lab uses URL hash fragments only as a demonstration, not a general router. On route change it updates document title, heading, breadcrumb and active links, announces the new view through a polite status region, and focuses the new heading. The initial page render does not steal focus. Applications should replace the route-specific strings and hash handler with an accessible router that preserves history and back navigation.

Do not update visible content with no announcement or focus management. Do not replicate destination labels differently between compact, medium and expanded modes. Never rely solely on color to identify the selected destination.

## Native modal side sheet

`.gc-side-sheet` extends a native `<dialog>` opened with `showModal()` through `initDialog`. It includes an accessible heading (`aria-labelledby`), description (`aria-describedby`), explicit close action, safe-area-aware footer, browser-provided Escape behavior, and trigger focus return. Its background becomes inert while the modal is open. Check whether an information panel truly requires modality; a persistent nonmodal detail pane may be more appropriate for desktop productivity.

The side sheet fills compact widths, and occupies a bounded inline-end portion on larger screens. It is always solid Surface, not translucent Lens, so long-form text remains legible.

## Token and material rules

Use `--gc-v1-color-*` semantic roles, `--gc-v1-color-focus-ring` for keyboard focus, and `--gc-v1-color-divider` for boundaries. Avoid hardcoded component colors. The shared runtime honors dark mode, increased contrast, forced colors, and reduced transparency. Navigation selection and status must remain discernible in forced-colors mode. Prefer logical inline/block CSS properties for RTL adaptation.

## Validation evidence and gaps

Automated source contracts are in `tests/adaptive-shell.test.mjs`; browser checks are in `e2e/adaptive.spec.mjs`; responsive captures are in `e2e/adaptive-visual.spec.mjs`. They cover viewport selection, current destination consistency, focus after route change, side-sheet dismissal, OS theme preferences, and 320px overflow.

**Not yet certified:** actual browser test success, visual approval, mobile browser bars, tablet split view, live OS safe-area hardware, screen-reader behavior, keyboard/remote navigation on TV, RTL and translated strings, and native app adapters. The current application data is illustrative; the lab does not fetch external accounts or persist project data.
