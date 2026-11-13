# Signal Constellation & Timeflow — GoreeCloud UI (alpha)

**Status:** review-branch web UI pattern. Not deployed, not a live monitor, and not a
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
       data-gc-signal-summary>Showing 2 of 2 signals</p>
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
    <ol class="gc-timeflow" aria-label="Workspace activity">
      <li><time datetime="2026-11-12T09:20">09:20</time>
          <strong>Example status changed</strong></li>
    </ol>
  </div>
</section>
```

```js
import { initSignalBoard } from "@goreecloud/ui/signal-board";

const board = initSignalBoard(document.querySelector("#signals"));
board.setFilter("attention");  // select a present, enabled filter
board.refresh();               // call after controlled DOM insert/removal/state change
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
  announces counts. The initial All filter must be enabled.
- Filtering uses `hidden` on direct `li` children of a native list.
  An item containing focus cannot be hidden without first moving focus to the
  chosen visible filter. Empty filter results expose written empty guidance.
- `refresh()` validates every current direct list item *before* changing
  visibility. Call it when the application adds/removes items or updates states;
  the component does not continuously observe private records.
- `dispose()` removes interaction listeners and restores captured pre-existing
  visibility, button attributes, count text and summary. Repeated disposal is
  harmless. Calling `refresh()` or `setFilter()` afterward throws.
- Timeline entries use native `<ol>`, `<li>` and `<time datetime>` markup;
  they are **not** sorted or fetched by the library. Consumers ensure that the
  documented order and timestamps match their actual authorized source.

### Visual language and fallbacks

The header uses existing `--gc-lens-fill`, `--gc-blur-lens`, semantic accents
and shadows; no new global hue or hardcoded service color is adopted. Cards use
Cloud Surface for reliable reading. On narrow viewports the cards become a
single column, and the Timeflow trail stacks below the status cards. RTL uses
logical inline spacing.

In reduced-transparency, more-contrast, manual `data-gc-contrast="more"`,
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
