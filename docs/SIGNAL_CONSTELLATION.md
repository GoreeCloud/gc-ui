# Signal Constellation & Timeflow — GoreeCloud UI (alpha)

**Status:** merged alpha web UI source; not deployed, published as Stable, or a live monitor. Not a
GoreeCloud Mesh, Wardveil, GoreeShield or Identity enforcement component.

## Purpose

**Signal Constellation** is a reusable, selectively frosted Cloud Lens overview
of application-supplied status items. It pairs an explicit native filter group,
semantic counts, complete text states and a native chronological **Timeflow**
trail. Its meaningful differentiator is an at-a-glance signal + history
composition that preserves focus and clear context when the visible set changes.

This is a local presentation component. It performs **no fetch, polling, storage,
telemetry, authorization, notification, alert generation or synchronization**.
Applications must supply truthful current data and independently authorize
actions. The design lab supplies unmistakably fictional examples.

### DOM contract

Import `@goreecloud/ui/tokens.css` and `@goreecloud/ui/components.css`, then
`initSignalBoard` from the root or `@goreecloud/ui/signal-board`:

```html
<section class="gc-signal-board" aria-labelledby="signal-title" id="signals">
  <header class="gc-signal-board__lens">
    <h2 id="signal-title">Workspace signals</h2>
    <dl class="gc-signal-board__counts">
      <div><dt>All</dt><dd data-gc-signal-count="all">2</dd></div>
      <div><dt>Ready</dt><dd data-gc-signal-count="ready">1</dd></div>
      <div><dt>Needs review</dt><dd data-gc-signal-count="attention">1</dd></div>
    </dl>
  </header>
  <div class="gc-signal-board__body">
    <div class="gc-signal-board__filters" role="group"
         aria-label="Filter workspace signals" data-gc-signal-filters>
      <button type="button" aria-pressed="true" data-gc-signal-filter="all">All</button>
      <button type="button" aria-pressed="false" data-gc-signal-filter="ready">Ready</button>
      <button type="button" aria-pressed="false" data-gc-signal-filter="attention">Needs review</button>
    </div>
    <p role="status" aria-live="polite" aria-atomic="true"
       data-gc-signal-summary>Showing 2 of 2 signals; 1 of 1 related events</p>
    <ul class="gc-signal-board__list" data-gc-signal-list>
      <li class="gc-signal-card" data-gc-signal="ready">
        <span class="gc-signal-card__state">Ready</span>
        <h3>Local workspace</h3>
      </li>
      <li class="gc-signal-card" data-gc-signal="attention">
        <span class="gc-signal-card__state">Needs review</span>
        <h3>Another workspace</h3>
      </li>
    </ul>
    <p data-gc-signal-empty hidden>No matching signals.</p>
    <ol class="gc-timeflow" data-gc-timeflow-list
        aria-label="Workspace activity by status">
      <li data-gc-signal="attention">
        <time datetime="2026-11-12T09:20">09:20</time>
        <span class="gc-timeflow__state">Needs review</span>
        <strong>Example status changed</strong>
      </li>
    </ol>
    <p class="gc-timeflow__empty" data-gc-timeflow-empty hidden>
      No activity for this status.
    </p>
  </div>
</section>
```

```js
import { initSignalBoard } from "@goreecloud/ui/signal-board";

const board = initSignalBoard(document.querySelector("#signals"));
board.setFilter("attention");  // select a present, enabled filter
board.refresh();               // call after controlled card/event insert/removal/state change
board.dispose();               // restore original presentation and listeners
```

The supported item states are exactly `ready`, `attention`, and `offline`;
the filter values add `all`. Unsupported values throw rather than being
silently interpreted as safe or healthy. Use explicit human-readable labels
("Ready", "Needs review", "Offline") **in addition to distinct marker shapes
and semantic colors**. Counts come from items in this one component, not an
unverified global service registry.

### Accessibility and lifecycle

- Native `button` elements retain Enter and Space activation, focus rings and
  tab semantics; optional arrow and Home/End selection come from the existing
  `initToggleGroup` helper. Horizontal arrows honor RTL.
- The selected filter uses `aria-pressed`; an in-document `role="status"`
  announces counts and, when Timeflow is linked, the matching event total.
  The initial All filter must be enabled.
- Filtering uses `hidden` on direct `li` children of a native list.
  An item containing focus cannot be hidden without first moving focus to the
  chosen visible filter. Empty filter results expose written empty guidance.
- `refresh()` validates every current direct list item *before* changing
  visibility. Call it when the application adds/removes items or updates states;
  the component does not continuously observe private records.
- `dispose()` removes interaction listeners and restores captured pre-existing
  visibility, button attributes, count text and summary. Repeated disposal is
  harmless. Calling `refresh()` or `setFilter()` afterward throws.
- **Optional linked Timeflow:** mark a labeled native `<ol>` with
  `data-gc-timeflow-list`, every direct `li` with a known
  `data-gc-signal="ready|attention|offline"` and a dated `<time datetime>`,
  and add `data-gc-timeflow-empty` to a visible-text empty message.
  Selecting a status filters **both** cards and related events; the single
  live summary announces visible/total signals and history. A status with no
  events displays the Timeflow empty message even when it has active signals.
  Without these opt-in attributes, the existing timeline remains static.
- `refresh()` validates both lists **before** changing either set. Unknown
  timeline states or missing dates fail closed, and failed user selection
  restores the previous toggle state. If focus is inside a history event that
  becomes hidden, it moves to the selected filter first.
- Timeflow entries are **not** sorted, fetched, timestamp-interpreted or
  authenticated by the library. Consumers ensure that the displayed chronology,
  dates, state mappings, missing/stale indicators, and labels match an authorized
  data source. `dispose()` restores originally hidden history items and the
  caller's empty message, including when events were filtered away.

### Visual language and fallbacks

The header uses existing `--gc-lens-fill`, `--gc-blur-lens`, semantic accents
and shadows; no new global hue or hardcoded service color is adopted. Cards use
Cloud Surface for reliable reading. On narrow viewports the cards become a
single column, and the Timeflow trail stacks below the status cards. RTL uses
logical inline spacing.

The baseline Cloud Lens header is **solid**. Only browsers that
support `backdrop-filter` or `-webkit-backdrop-filter` receive the true
translucent `--gc-lens-fill` plus optical blur and decorative ambiance. In
reduced-transparency, more-contrast, manual `data-gc-contrast="more"`,
manual `data-gc-transparency="reduce"`, or forced-colors environments, the
frosted header must become solid and blur-free. Forced-colors uses system
Canvas and CanvasText and retains visible selected/focus indications.
No animation is necessary to understand a changed status.

### Consumer safety and release limits

Treat service health, sync state, device reachability and security posture as
**untrusted application-supplied facts**, not the UI's own measurements.
Before displaying live data, the consuming app must implement appropriate
authorization (GoreeCloud Identity), privacy protections (GoreeShield),
security controls (Wardveil), service integration (Mesh), stale-data handling,
and verified success/failure/last-updated labels. Never infer "ready" from
missing data. Do not persist or exfiltrate user data through the component.

Testing includes unit contracts and Chromium keyboard, dynamic refresh, empty,
focus-transfer, disposal, mobile, dark, forced-colors and RTL/400% CSS-root
reflow checks. These do **not** establish actual 400% browser zoom, native
platform adapters, OS screen-reader acceptance or WCAG certification.

### Filter availability changes

If an application disables the selected filter after initialization, call `refresh()`. It validates both lists, then preserves the current filter if enabled; otherwise it chooses enabled **All**, or the first enabled state if All is also disabled. It updates `aria-pressed` and the roving keyboard Tab stop together. If every filter is disabled, `refresh()` throws without changing the selected view until the application restores at least one enabled choice. Programmatic `setFilter()` continues to return `false` for a disabled or absent filter. No polling or permission decision is performed by this presentation controller.

### Dated integration checkpoint — November 13, 2026

This component entered public `main` through [PR #77](https://github.com/GoreeCloud/gc-ui/pull/77), commit [`9d8380d`](https://github.com/GoreeCloud/gc-ui/commit/9d8380d3de8637cbdbd270b43d9a0a53f1fff664). Its [branch source/package and browser smoke jobs passed](https://github.com/GoreeCloud/gc-ui/actions/runs/43424884496); a later Chromium horizontal-wheel fixture failure was independently corrected through [PR #79](https://github.com/GoreeCloud/gc-ui/pull/79) and [subsequent passing main CI](https://github.com/GoreeCloud/gc-ui/actions/runs/43429549803). Material isolation checks were expanded in [PR #80](https://github.com/GoreeCloud/gc-ui/pull/80). These are tested source components, not verified live service-health data, consumer authorization, native adapters or deployed products.
