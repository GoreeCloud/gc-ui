# GoreeCloud UI — Native-first web component patterns

**Maturity:** alpha web reference; these are semantic CSS classes, not claims that every control has a custom element implementation.

Import src/tokens.css and then src/components.css. Place gc-app on the document body. Use actual HTML button, input, label, select, progress, meter, dialog, nav and table elements and preserve their browser semantics.

| Family | CSS classes / API | Usage contract |
| --- | --- | --- |
| Layout | gc-container, gc-grid, gc-grid--two, gc-layout, gc-stack, gc-cluster | Reading order stays DOM order |
| Typography | gc-display, gc-title, gc-section-title, gc-heading, gc-support, gc-label | Use real heading levels |
| Material | gc-canvas, gc-surface, gc-surface--tonal, gc-lens | Prefer opaque surfaces for dense reading |
| Containers | gc-card, gc-card--tonal, gc-card--interactive | Clickable cards still require actual links or buttons |
| Buttons | gc-button, --secondary, --outline, --quiet, --danger, --sm, --lg, --round, --icon | Descriptive accessible names and focus styles |
| Inputs | gc-field, gc-input, gc-select, gc-textarea, gc-field__hint, gc-field__error | Associated labels, describedby and aria-invalid |
| Choices | gc-check, gc-radio, gc-switch, gc-chip, gc-segmented | Native state, checked or aria-pressed |
| Status | gc-badge, gc-alert, gc-progress, gc-meter | Visible words in addition to color |
| Navigation | gc-nav, gc-topbar, gc-tabs, gc-tabpanel; gc-navigation-shell, gc-navigation-rail, gc-navigation-rail__links | Native links, aria-current and accessible icon-only collapsed mode on tablet/desktop/web |
| Data | gc-list, gc-table, gc-table-wrap, gc-kbd | Native list/table headers |
| Feedback | gc-dialog, gc-toast-region, gc-toast, gc-skeleton, gc-empty | Native modal, announcements, meaningful loading states |
| Identity and icons | gc-avatar; gc-icon, iconSvg() | Image alt and icon-only button names |

### Field example

    <div class="gc-field">
      <label for="account-name">Account name</label>
      <input class="gc-input" id="account-name" aria-describedby="account-hint" required>
      <small class="gc-field__hint" id="account-hint">A local demo only.</small>
    </div>

### Tab example

    <div class="gc-tabs" role="tablist" aria-label="Settings">
      <button id="account-tab" role="tab" aria-controls="account-panel" aria-selected="true">Account</button>
      <button id="privacy-tab" role="tab" aria-controls="privacy-panel">Privacy</button>
    </div>
    <section id="account-panel" role="tabpanel" aria-labelledby="account-tab">...</section>
    <section id="privacy-panel" role="tabpanel" aria-labelledby="privacy-tab">...</section>

Call initTabs(tablistElement). Arrow keys select and focus tabs; Home and End select endpoints; RTL reverses horizontal arrow direction. The cleanup callback removes listeners. Panels need unique IDs within one document.

### Dialog, icon and toast APIs

Use native dialog.showModal via openDialog(dialogElement, invokerElement) to preserve Escape/focus behavior; closeDialog safely closes it. The toast(text, { kind: "positive" }) utility inserts a dismissible status into a supplied region or document body. Do not substitute toasts for permanent validation errors.

Call defineCustomElements() to register the small gc-icon element. Decorative SVGs are hidden from screen readers; give a descriptive aria-label to the enclosing button for an icon-only action. Do not allow user-authored SVG path markup.

### Quality gate for future controls

Each new component must document: semantic role; keyboard, pointer and touch behavior; responsive footprint; loading/empty/error/disabled and selected states; dark/light/contrast handling; reduced-motion and transparency fallback; representative testing and correct consumer integration. A web component library does not constitute a native mobile or desktop SDK.


## Interaction expansion — alpha

Additional native-first patterns are implemented through CSS and small opt-in JS behaviors:

| Pattern | CSS | Controller |
| --- | --- | --- |
| Disclosure accordion | gc-accordion, gc-accordion__content on native details/summary | initAccordion(container, { single: true }) |
| Side drawer | gc-drawer, gc-drawer__header on native dialog | initDrawer(dialog, openButton, closeButton) |
| Range | gc-range, gc-range-value on native input[type=range] and output | bindRangeOutput(input, output, { format }) |
| Exclusive toolbar | gc-toolbar, gc-chip, aria-pressed buttons | initToggleGroup(container, { onChange }) |
| Steps | gc-steps on ol, data-step, aria-current=step | Native structural markup, no controller |
| Breadcrumbs | gc-breadcrumbs on nav > ol > li | Native links and aria-current=page |
| Key/value details | gc-details-list on dl > dt + dd | Native semantics |

Controllers expose cleanup callbacks; invoke them when a view unmounts. Avoid manually imitating radio, details or dialog behavior where native elements are available. A button-only toggle toolbar is for view selection, not a substitute for form radio inputs. Disabled items are not arrow-key destinations. Do not put a click handler on an inert card without a semantic control.

createThemeController(root, options) accepts the same options as applyTheme(), returns update(next) and dispose(), and automatically recalculates custom accent colors on OS dark/light changes in auto mode. This opt-in watcher does **not** use local storage or network. Call dispose() to unregister the system listener. Curated palettes already respond to system appearance through CSS alone.

See the reference laboratory's Patterns section for keyboard and real native-control examples. Those examples are not device acceptance or a native OS component library.

## Command palette — searchable local actions

The optional native-dialog launcher is available from `@goreecloud/ui/commands` or the root package, styled with `gc-command`, `gc-command__header`, `gc-command__search`, `gc-command__list`, `gc-command__item`, `gc-command__meta`, and `gc-command__footer`.

Use a `<dialog class="gc-command" aria-labelledby="...">` containing a labeled `input[type=search]`, a list of real `button[data-gc-command]` elements, and preferably `[data-gc-command-status]` live status plus `[data-gc-command-empty]` empty feedback. Provide searchable aliases using `data-gc-keywords`. Do not inject untrusted HTML as labels.

`initCommandPalette(dialog, { trigger, shortcut: true, onSelect })` returns `{ open, close, refresh, dispose }`. A **required** `onSelect(button)` callback prevents dead-end command shells. Ctrl/⌘K opens the modal; Escape uses native dialog behavior. Filter using input, move with Arrow Up/Down, select with Enter, and jump Home/End in the command list. Hidden or disabled entries are not activated. During IME text composition, command searching waits until the composition is committed, Enter/arrow-key events are not captured as command activation/navigation, and Ctrl/⌘K shortcuts are ignored; modifier combinations such as Ctrl+Shift+K retain their native or host behavior. For asynchronous callbacks, the modal closes only after success **in the same still-open dialog session**; rejection keeps that session open with a non-sensitive error message. If the user dismisses or reopens the dialog before the pending operation finishes, its stale result cannot close the newer dialog or display a late error. Ordinary Escape or explicit close returns focus to the invoker when focus still belongs to the dialog; a user who has already focused another control will not have that focus stolen. The underlying consumer action is not cancelled by dismissal, so consumers must own cancellation, deduplication and server authorization.

Consumer apps must independently verify authorization through GoreeCloud Identity and integrate GoreeShield privacy, Wardveil cybersecurity and GoreeCloud Mesh connectivity policies. Hiding a button is not authorization. Do not report backend success until the actual backend response arrives. This component itself performs no network call or storage write.

### Tablist keyboard and disabled-state contract

`initTabs()` supports horizontal arrow navigation (RTL-aware Left/Right), vertical arrow navigation (Up/Down when `aria-orientation="vertical"`), and Home/End. Native disabled, `aria-disabled="true"` and hidden tabs are excluded from navigation and selection; a tablist without any enabled tab is invalid. The controller keeps `aria-selected`, sequential tab focus and panel visibility synchronized and exposes a cleanup callback. Use unique `aria-controls`/tabpanel IDs and supply semantic labels for the enclosing tablist. This does not substitute for human screen-reader testing.

## Native popover action menus

Async action lifetime: a pending consumer callback may complete after the popover is dismissed externally, closed explicitly, reopened or disposed. A result from an older menu session must never move focus to the trigger, close a newer menu session, or announce an outdated failure. Neutral local failure status is shown only while the same menu session remains open. This does not cancel or authorize the underlying consumer action; callers own cancellation, idempotency and server-side enforcement.

Keyboard improvements: while the native menu is open, single-character typeahead selects the next enabled matching item, repeated letters cycle matching items, and Home/End/arrow keys retain native-like focus behavior. Composition events and Ctrl/Meta/Alt shortcuts are ignored. The typeahead buffer is cleared on normal close and external popover dismissal. Menu selection still invokes only the consumer-supplied handler; no backend action or authorization is implied.


Use a labeled trigger button and `<div class="gc-menu" popover="auto" role="menu" aria-label="...">` containing real `<button class="gc-menu__item" role="menuitem" type="button">` choices. Initialize with `initActionMenu(trigger, menu, { onSelect })` from `@goreecloud/ui/menu`. The required callback is responsible for action authorization and actual success; menu buttons must not directly mutate services without approved controls. The API returns `open(last?)`, `close(returnFocus?)`, and `dispose()`.

Native popover supplies the top layer, click-outside dismissal, and Escape fallback. Arrow Up/Down opens the first/last enabled item from the trigger and navigates choices; Home/End jump to boundaries. Disabled and aria-disabled entries are skipped. Buttons use keyboard-native activation. Programmatic completion restores focus to the trigger; outside click does not steal focus. A rejected asynchronous callback leaves the menu open with a generic error. Positioning adapts to viewport edges, and scrolling dismisses floating controls. Always provide a visible descriptive label or accessible name, and use menus for **actions** rather than ordinary site navigation links. No menu item may be treated as an authorization boundary.

Color, elevation, responsive width, reduced-contrast and forced-colors styling are handled by semantic `gc-menu` classes. Browser popover support and assistive-technology behavior must be verified on supported devices; non-supporting browsers should be offered a native alternative rather than a fabricated inert menu.

## Sortable native data tables

Place real column-header buttons inside native th elements with scope=col and data-gc-sort=text, number or date. Wrap the table with gc-table-wrap, and supply a native caption. Initialize with initSortableTable(table, { locale, onSort }), exported from @goreecloud/ui/table or the root module.

Clicking a header toggles ascending/descending and sets aria-sort on the appropriate th; other headers receive none. The returned controller exposes sortBy(columnIndex, direction), reset(), refresh() and dispose(). The new `refresh()` reconciles dynamically inserted/removed DOM rows, returns the live row count, and re-applies the current user sort (or reset order when no sort is active). Existing retained rows preserve their original insertion-order ties; new rows join the baseline in their observed DOM insertion order, and removed rows are never resurrected by reset(). Equal values retain their original row order; blank or invalid values remain last even in descending order. Text uses Intl.Collator with numeric substrings; numbers use strict decimal parsing; dates accept only real ISO YYYY-MM-DD calendar dates. Use data-sort-value on cells for formatted currency and localized dates.

This is an intentionally client-only enhancement. It reorders currently present `tbody` rows and does not fetch, paginate or sort unseen records. Call `refresh()` after adding, removing, or replacing data rows; reinitialize if the table's column/header structure changes. The consumer must implement server-side sorting, authorization, filtering, pagination, safe rendering and actual assistive-technology testing independently.

## Hierarchical treeview for settings, files and application navigation

initTreeView(tree, { onSelect, onActivate, locale }) is available from @goreecloud/ui/tree or the root module. It enhances a labeled role=tree container holding role=treeitem nodes with nested role=group subtrees. Provide visually labeled .gc-tree__row children; use data-gc-tree-label or aria-label for typeahead. Only branch nodes use aria-expanded, and aria-selected marks the single active item.

Up/Down and Home/End move through visible enabled nodes with one roving Tab stop. Left/Right expand and collapse or enter/leave a subtree, reversed for RTL. Typeahead matches the next visible item by localized prefix (700 ms key buffer), and repeated initials cycle matching nodes. IME composition and modified keyboard shortcuts are ignored. Click or Enter/Space selects and activates leaves; branches expand/collapse. Use onSelect for navigation state and onActivate for actual actions. Both callbacks are consumer-owned.

Hidden, disabled and aria-disabled entries are skipped. Collapsing a branch whose descendant is selected restores focus to the parent. The controller provides select(item), refresh(), expand(item), collapse(item), and dispose(). Call refresh() after dynamically hiding or disabling nodes to move the roving tab stop to an eligible ancestor or fallback; if every node becomes unavailable, no item remains tabbable until an eligible node returns. Reinitialize after adding/removing nodes.

Semantic token CSS uses Cloud Surface and brand container, 44px minimum rows, logical indentation, visible keyboard focus and forced-colors boundaries. Do not nest extra keyboard-interactive controls inside treeitem. Render untrusted labels with textContent instead of raw HTML.

No filesystem permissions, network access, persistence, virtualization or external authorization are provided. Assistive technology, large-tree performance, RTL, native OS and real-device acceptance remain unverified.

## Searchable editable combobox

Use a visible native label and a text or search input with role=combobox, aria-controls pointing to an identified role=listbox, plus stable unique IDs on its role=option choices. Place both inside a gc-combobox wrapper. Use gc-combobox__list and gc-combobox__option for semantic styling. Add aria-describedby pointing to a nearby role=status element for no-results and action error announcements. Never put HTML received from untrusted services directly into an option; create DOM elements and assign textContent.

Initialize initCombobox(input, list, { onSelect }) from @goreecloud/ui/combobox or the root module. The controller sets aria-expanded, aria-haspopup=listbox and aria-autocomplete=list, filters locally on input, and keeps DOM focus on the input while arrow keys move aria-activedescendant. Escape closes, Enter commits the highlighted option, Tab closes without preventing native focus movement, and pointer selections preserve input focus. Disabled items are not selected. Each selected option receives aria-selected=true and the real input value updates only after onSelect succeeds. When the listbox is open, Home and End move the active descendant to the first/last visible enabled option; with the listbox closed, the input retains native text-editing Home/End behavior. Refresh clears a stale active descendant if an option becomes disabled dynamically. Async selections still block competing input and commit only after successful completion.

An optional onSelect(option, value) callback can perform an authorized asynchronous action. A pending callback sets aria-busy; rejected actions keep the popup open with a generic non-sensitive error. The controller returns open(), close(), refresh() and dispose(). Data values are local and never transmitted by the component; consumers must authorize actual operations, validate service responses, and decide whether to persist or emit form events.

This alpha combobox is not a virtualized remote autocomplete, does not create or fetch options and does not replace simpler native select controls when search is unnecessary. Browser, localization, screen-reader and touch acceptance remain consumer responsibilities.

## Floating bottom destination navigation

GoreeCloud UI applications with multiple primary destinations use a rounded floating Cloud Lens capsule anchored above system gesture insets. The web implementation uses a labeled nav.gc-bottom-nav and two to six native anchors with gc-bottom-nav__link, href, original icons and visible labels. Set gc-bottom-nav-content on the main scrolling region so controls are not obscured by the dock.

Initialize initBottomNavigation(nav, {onNavigate}) from @goreecloud/ui/bottom-nav or the root package. Synchronous onNavigate(link) may return false to veto navigation; otherwise a real same-origin native anchor retains ordinary behavior. The selection exposes aria-current=page and follows hashchange/popstate. Arrow Left/Right (RTL-aware) plus Home/End move focus without navigating or changing selection. Native Enter still activates the link. The controller returns select, sync and dispose.

Disabled choices are skipped. Non-HTTP(S), cross-origin, empty and duplicate destinations are rejected. No telemetry, persistence, backend authority or server route is provided by the controller. Integrating applications retain GoreeCloud Identity authorization, GoreeShield privacy, Wardveil cybersecurity and Mesh boundaries.

Use original meaningful visible labels, high-contrast and reduced-transparency fallbacks, safe-area insets, touch minimums and scroll-space padding. Do not duplicate bottom docks or show faux tabs on one-destination screens. Native platform adapters and screen-reader/gesture-device acceptance remain unverified.

For premium mobile layouts, use concise visible destination names (for example, Library instead of Components). At enlarged text sizes or with translated labels, links must keep the full readable label rather than ellipsizing it; the dock may overflow **within its capsule** and become horizontally scrollable without scrolling the entire document. A thin, semantic-token-colored scrollbar is exposed when content overflows in browsers that render scrollbars; some touch operating systems automatically hide it, so consumers must still verify touch-swipe and keyboard reachability. Focus, active state and native link semantics remain independent. Browser QA now also exercises genuine 400% RTL navigation, confirming mirrored ArrowLeft/ArrowRight semantics and Home/End offscreen reachability, while preserving page-level reflow. Chromium also verifies horizontal-wheel scrolling on a 390px viewport with 400% CSS-root text (scroll position changed from 0 to 328 pixels) without page overflow. A separate RTL + forced-colors browser case drives horizontal-wheel input in both directions, checks negative RTL scroll coordinates and verifies that navigation remains internal rather than scrolling the page. Headless synthetic touch gestures did **not** produce reliable movement in this runner; touch input remains **unverified** and requires actual mobile/device testing. Chromium emulation is not real screen-reader, physical touch-gesture, OS-overlay-scrollbar, or device acceptance.

### Navigation callback fail-closed behavior

`onNavigate` is intentionally **synchronous**. Only returning `true` or `undefined` permits the browser's native link activation. Returning `false`, an unexpected value, or a Promise prevents the default link action, as does throwing an exception. Asynchronous authorization must be performed by the application before deciding to enable a destination; an async callback does not authorize navigation. This control blocks only default browser navigation, not side effects initiated directly by a consumer callback.

### Dynamic dock height / content clearance

Pass `{ content: scrollRegionElement }` to `initBottomNavigation` when the dock overlays a scrolling application. The controller measures the actual capsule and its bottom inset, sets the local `--gc-bottom-nav-clearance` on the supplied element, tracks changes with ResizeObserver and window resize fallback, and restores the previous value at disposal. The existing `.gc-bottom-nav-content` class retains conservative CSS padding if JavaScript is unavailable. This avoids obscuring last-row content when larger text or translations increase dock height. The content must belong to the same document.

### Accessibility-tree acceptance evidence

The real Chromium browser-smoke runner now inspects non-ignored accessibility-tree roles and names for the named floating dock navigation, destination links, rounded window heading, native modal dialog and actionable buttons in desktop light and mobile dark. A button that becomes unnamed in the accessibility tree fails CI. This strengthens automated semantics checks but is not a substitute for platform screen-reader or real-device acceptance.

### Modifier-click and route-state safety

When a navigation link is opened in another tab/window, downloaded, modified with Ctrl/Meta/Shift/Alt or uses an alternative browsing context, the local page's active destination must **not** change. A click already canceled by a consumer handler must also preserve `aria-current` and must not invoke `onNavigate`. Disabled destinations remain blocked even on modified clicks. Only an ordinary, non-canceled, current-tab activation may optimistically set the current visual destination; consumer routing/Identity authorization remains authoritative.

### Floating dock inside a rounded application window

Use gc-window gc-window--app-shell with a scrollable gc-window__body and its sibling gc-bottom-nav gc-bottom-nav--window for desktop-like multiwindow applications. The capsule stays within all four rounded window corners and never follows the browser viewport. Browser acceptance checks 320/390/900/1440px geometry and captures mobile/desktop screenshots. This is an alternative to the page-level dock, not a second dock for one real consuming app.


## Adaptive navigation rail (alpha)

Use `initNavigationRail(rail, { collapsed?: boolean })` on a named native `aside` containing a named `nav.gc-navigation-rail__links`, a `button[data-gc-rail-toggle]` with an exact `aria-controls` target, and labeled native links. The API returns `{ collapsed, setCollapsed, toggle, sync, dispose }`. Default collapsed on tablet (601–1023 CSS px), expanded on desktop (1024+); phone has its own bottom navigation. Full example and acceptance boundary: [NAVIGATION_RAIL.md](NAVIGATION_RAIL.md). No storage, telemetry or service authorization is performed by the controller. Human AT and real-device acceptance remain open.

### Editable combobox IME behavior (alpha)
The native input retains composition ownership for language IMEs. While composing, the
combobox does not hijack Enter, Escape, Home/End or arrow keys, select a suggestion,
or filter on intermediate preedit text. Filtering resumes on `compositionend`;
legacy `keyCode=229` key events remain native. Real device/IME and assistive
technology acceptance is still required. This behavior has no server authority.

### Combobox pointer gestures during composition (alpha)

An editable combobox does not select a suggestion while the input method is composing. If an option pointerdown begins during preedit, its later click is ignored even when compositionend occurs between those events. A new pointer gesture after composition is allowed; pointer cancellation clears the one-click suppression. This prevents premature selection in a local UI controller; real IME and assistive-technology acceptance remains separate.

### Dynamic command palette registration (alpha)

`refresh()` now reconciles the actual `button[data-gc-command]` elements in the native dialog: late-added commands become keyboard/pointer actionable, removed commands lose their handlers, and repeated refresh calls do not duplicate listeners. A focused command removed while the dialog is open transfers focus to the search input. An initialized palette may temporarily have zero commands, showing its empty feedback until new native commands arrive. Call `refresh()` after changing the DOM; this is local UI discovery, **not** remote Mesh capability authorization or a plugin execution permission. Keep labels as text, preserve `onSelect` authorization, and call `dispose()` to remove all bound listeners.

### Command palette disposal and modal lifecycle (alpha)

Calling `dispose()` on an open palette closes its native modal before detaching listeners and clears stale busy state. If the previously focused invoker still exists and focus belonged to the dialog, it restores the invoker; an explicit focus move to another control is preserved. This also handles browsers that queue the native `close` event rather than dispatching it immediately. A late pending action cannot announce a stale failure or reopen a disposed modal. This is local UI lifetime behavior, not an application authorization check.

### Reopened command palette session isolation (alpha)

A pending command action blocks repeat activation only inside the dialog session that started it. Closing and reopening the palette allows the new session to launch its own command even while an older callback remains unresolved. Old completions and failures cannot close, mark busy, or overwrite status in the new session; the current session retains its truthful busy/error state. The controller does not cancel the old action or undo any side effects: application-specific authorization, cancellation, and idempotency remain the product owner's responsibility.

### Cancellable command actions (alpha)

The native command palette now passes a second `onSelect(button, { signal })` argument. Each invocation receives a fresh `AbortSignal`, allowing consumers to cooperatively stop their own pending work after explicit close, native Escape/light-dismiss, or `dispose()`. A new dialog session has an independent signal, and successful actions are not falsely signaled as cancelled. Existing one-argument callbacks continue to work. **Aborting is a notification, not enforced cancellation or rollback**: consumers must check or forward the signal, verify actual Identity permissions, and apply owner-side idempotency and transaction rules. Do not claim that a cancelled UI session stopped a remote operation.

### Optional automatic command DOM synchronization (alpha)

`initCommandPalette(dialog, { observeMutations: true, onSelect })` installs a native `MutationObserver` scoped to that dialog. Added/removed `button[data-gc-command]` nodes, command text, and selected command or disabled-state attributes trigger `refresh()` automatically. The observer ignores the controller's own status-text updates and filtering visibility changes to avoid recursive refresh cycles, defers during IME composition, and disconnects on `dispose()`. It is **opt-in**: manual `refresh()` remains the default, and enabling observation requires the browser's `MutationObserver` to be available. This updates only local UI discovery, not Mesh capability authorization or backend execution permissions.

### Action-menu session-scoped cancellation and recovery (alpha)

`initActionMenu(trigger, menu, { onSelect })` now supplies `onSelect(item, { signal })`. Each native popover activation receives its own cooperative `AbortSignal`. Closing via trigger/Escape, scrolling, native light-dismiss (including synchronous `beforetoggle`), or `dispose()` aborts the active action and clears stale busy state. A subsequently opened menu can start a separate action without waiting for an older callback; older results cannot dismiss the new menu, clear its busy status or disclose stale errors. A successfully completed synchronous or asynchronous action is **not** falsely signaled as cancelled. Existing one-argument callbacks still work. This UI signal does not terminate an uncooperative owner, reverse remote side effects or grant Identity/Mesh permissions. Product consumers must implement signal forwarding, authorization checks and idempotent owner-side behavior.
