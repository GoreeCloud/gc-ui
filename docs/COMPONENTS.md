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
| Navigation | gc-nav, gc-topbar, gc-tabs, gc-tabpanel | aria-current and correct tablist relationships |
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

`initCommandPalette(dialog, { trigger, shortcut: true, onSelect })` returns `{ open, close, refresh, dispose }`. A **required** `onSelect(button)` callback prevents dead-end command shells. Ctrl/⌘K opens the modal; Escape uses native dialog behavior. Filter using input, move with Arrow Up/Down, select with Enter, and jump Home/End in the command list. Hidden or disabled entries are not activated. For asynchronous callbacks, the modal closes only after success; rejection keeps it open with a non-sensitive error message. Focus returns to the invoker on close.

Consumer apps must independently verify authorization through GoreeCloud Identity and integrate GoreeShield privacy, Wardveil cybersecurity and GoreeCloud Mesh connectivity policies. Hiding a button is not authorization. Do not report backend success until the actual backend response arrives. This component itself performs no network call or storage write.

### Tablist keyboard and disabled-state contract

`initTabs()` supports horizontal arrow navigation (RTL-aware Left/Right), vertical arrow navigation (Up/Down when `aria-orientation="vertical"`), and Home/End. Native disabled, `aria-disabled="true"` and hidden tabs are excluded from navigation and selection; a tablist without any enabled tab is invalid. The controller keeps `aria-selected`, sequential tab focus and panel visibility synchronized and exposes a cleanup callback. Use unique `aria-controls`/tabpanel IDs and supply semantic labels for the enclosing tablist. This does not substitute for human screen-reader testing.

## Native popover action menus

Use a labeled trigger button and `<div class="gc-menu" popover="auto" role="menu" aria-label="...">` containing real `<button class="gc-menu__item" role="menuitem" type="button">` choices. Initialize with `initActionMenu(trigger, menu, { onSelect })` from `@goreecloud/ui/menu`. The required callback is responsible for action authorization and actual success; menu buttons must not directly mutate services without approved controls. The API returns `open(last?)`, `close(returnFocus?)`, and `dispose()`.

Native popover supplies the top layer, click-outside dismissal, and Escape fallback. Arrow Up/Down opens the first/last enabled item from the trigger and navigates choices; Home/End jump to boundaries. Disabled and aria-disabled entries are skipped. Buttons use keyboard-native activation. Programmatic completion restores focus to the trigger; outside click does not steal focus. A rejected asynchronous callback leaves the menu open with a generic error. Positioning adapts to viewport edges, and scrolling dismisses floating controls. Always provide a visible descriptive label or accessible name, and use menus for **actions** rather than ordinary site navigation links. No menu item may be treated as an authorization boundary.

Color, elevation, responsive width, reduced-contrast and forced-colors styling are handled by semantic `gc-menu` classes. Browser popover support and assistive-technology behavior must be verified on supported devices; non-supporting browsers should be offered a native alternative rather than a fabricated inert menu.

## Sortable native data tables

Place real column-header buttons inside native th elements with scope=col and data-gc-sort=text, number or date. Wrap the table with gc-table-wrap, and supply a native caption. Initialize with initSortableTable(table, { locale, onSort }), exported from @goreecloud/ui/table or the root module.

Clicking a header toggles ascending/descending and sets aria-sort on the appropriate th; other headers receive none. The returned controller exposes sortBy(columnIndex, direction), reset() and dispose(). Equal values retain their original row order; blank or invalid values remain last even in descending order. Text uses Intl.Collator with numeric substrings; numbers use strict decimal parsing; dates accept only real ISO YYYY-MM-DD calendar dates. Use data-sort-value on cells for formatted currency and localized dates.

This is an intentionally client-only enhancement. It reorders the initial tbody rows and does not fetch, paginate or sort unseen records. Reinitialize after replacing rows. The consumer must implement server-side sorting, authorization, filtering, pagination, safe rendering and actual assistive-technology testing independently.

## Hierarchical treeview for settings, files and application navigation

initTreeView(tree, { onSelect, onActivate, locale }) is available from @goreecloud/ui/tree or the root module. It enhances a labeled role=tree container holding role=treeitem nodes with nested role=group subtrees. Provide visually labeled .gc-tree__row children; use data-gc-tree-label or aria-label for typeahead. Only branch nodes use aria-expanded, and aria-selected marks the single active item.

Up/Down and Home/End move through visible enabled nodes with one roving Tab stop. Left/Right expand and collapse or enter/leave a subtree, reversed for RTL. First-letter typeahead moves to a matching visible item. Click or Enter/Space selects and activates leaves; branches expand/collapse. Use onSelect for navigation state and onActivate for actual actions. Both callbacks are consumer-owned.

Hidden, disabled and aria-disabled entries are skipped. Collapsing a branch whose descendant is selected restores focus to the parent. The controller provides select(item), expand(item), collapse(item), and dispose(). Reinitialize after adding/removing nodes.

Semantic token CSS uses Cloud Surface and brand container, 44px minimum rows, logical indentation, visible keyboard focus and forced-colors boundaries. Do not nest extra keyboard-interactive controls inside treeitem. Render untrusted labels with textContent instead of raw HTML.

No filesystem permissions, network access, persistence, virtualization or external authorization are provided. Assistive technology, large-tree performance, RTL, native OS and real-device acceptance remain unverified.

## Searchable editable combobox

Use a visible native label and a text or search input with role=combobox, aria-controls pointing to an identified role=listbox, plus stable unique IDs on its role=option choices. Place both inside a gc-combobox wrapper. Use gc-combobox__list and gc-combobox__option for semantic styling. Add aria-describedby pointing to a nearby role=status element for no-results and action error announcements. Never put HTML received from untrusted services directly into an option; create DOM elements and assign textContent.

Initialize initCombobox(input, list, { onSelect }) from @goreecloud/ui/combobox or the root module. The controller sets aria-expanded, aria-haspopup=listbox and aria-autocomplete=list, filters locally on input, and keeps DOM focus on the input while arrow keys move aria-activedescendant. Escape closes, Enter commits the highlighted option, Tab closes without preventing native focus movement, and pointer selections preserve input focus. Disabled items are not selected. Each selected option receives aria-selected=true and the real input value updates only after onSelect succeeds.

An optional onSelect(option, value) callback can perform an authorized asynchronous action. A pending callback sets aria-busy; rejected actions keep the popup open with a generic non-sensitive error. The controller returns open(), close(), refresh() and dispose(). Data values are local and never transmitted by the component; consumers must authorize actual operations, validate service responses, and decide whether to persist or emit form events.

This alpha combobox is not a virtualized remote autocomplete, does not create or fetch options and does not replace simpler native select controls when search is unnecessary. Browser, localization, screen-reader and touch acceptance remain consumer responsibilities.

## Floating bottom destination navigation

GoreeCloud UI applications with multiple primary destinations use a rounded floating Cloud Lens capsule anchored above system gesture insets. The web implementation uses a labeled nav.gc-bottom-nav and two to six native anchors with gc-bottom-nav__link, href, original icons and visible labels. Set gc-bottom-nav-content on the main scrolling region so controls are not obscured by the dock.

Initialize initBottomNavigation(nav, {onNavigate}) from @goreecloud/ui/bottom-nav or the root package. Synchronous onNavigate(link) may return false to veto navigation; otherwise a real same-origin native anchor retains ordinary behavior. The selection exposes aria-current=page and follows hashchange/popstate. Arrow Left/Right (RTL-aware) plus Home/End move focus without navigating or changing selection. Native Enter still activates the link. The controller returns select, sync and dispose.

Disabled choices are skipped. Non-HTTP(S), cross-origin, empty and duplicate destinations are rejected. No telemetry, persistence, backend authority or server route is provided by the controller. Integrating applications retain GoreeCloud Identity authorization, GoreeShield privacy, Wardveil cybersecurity and Mesh boundaries.

Use original meaningful visible labels, high-contrast and reduced-transparency fallbacks, safe-area insets, touch minimums and scroll-space padding. Do not duplicate bottom docks or show faux tabs on one-destination screens. Native platform adapters and screen-reader/gesture-device acceptance remain unverified.

For premium mobile layouts, use concise visible destination names (for example, Library instead of Components). Long single-line labels are safely ellipsized; the native link text remains available to assistive technology. Do not rely on truncation as a substitute for meaningful short labels.
