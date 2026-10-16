# GC UI — Canonical Component Catalog 1.0
**Scope:** component design and behavior contracts. **Status:** specification complete at catalog level; individual production components require implementation, tests, and sign-off.

## Contract every implementation MUST publish
Component ID/version, purpose, permitted platforms, semantic role, accessibility name/description, anatomy/slots, required/optional props, variants, state diagram, keyboard/touch/remote interactions, focus ordering, reduced-effect behavior, responsive rules, localization/RTL, token bindings, events, async/error handling, visual regression fixtures, unit/a11y tests and deprecation policy.

## Shared state machine
Default -> hovered (pointer-capable) -> pressed (pointer down or Space key) -> activated (on pointer up/Enter/Space, depending on semantics). Focus-visible is **orthogonal**, not a replacement for selection. Selected and expanded are separate persistent states. Loading blocks duplicate activation (and keeps dimensions stable); progress is announced. Invalid affects the relevant field/group and exposes readable help. Disabled remains noninteractive; read-only may still be selectable/copyable. Dragging is cancellable; use keyboard reorder alternative. When combinations compete: unavailable/disabled wins over press; busy wins over repeated action; invalid feedback remains until resolved; focus ring must remain visible.

## Style matrix
| Property | Quiet | Standard | Prominent | Danger |
|---|---|---|---|---|
| Container | none or surface-tonal | surface / outline | primary / onPrimary | danger / onDanger |
| State | neutral overlay | tonal overlay | controlled primary overlay | danger overlay |
| Shape | 12–18 | 18 | 18 / pill | 18 |
| Elevation | E0 | E0–E1 | E1 | E0–E1 |
| Focus | always external distinct ring | same | same | same |
These are shared intent categories; tabs, chips and dialogs may constrain permitted variants.

## 1. Actions (01–08)
| ID | Component | Anatomy & variants | Interaction / accessibility |
|---|---|---|---|
| A01 | Button | label, optional leading/trailing glyph, spinner; primary, secondary, outline, quiet, danger; S/M/L | Enter/Space; submit/reset types explicit; busy state does not change width; icon never sole confirmation |
| A02 | Icon button | hit zone 44; icon 20/24; quiet, filled, tonal, danger | programmatic name mandatory; toggle variant exposes pressed state; tooltip not substitute for name |
| A03 | Split button | main action + distinct menu trigger | separate focus stops; ArrowDown opens menu; default action predictable |
| A04 | Floating action | single elevated short action, optional label | one dominant FAB per task context; never obscure content or mobile nav |
| A05 | Segmented control | 2–5 choices; single value | one persistent selected item; use radio group when genuinely exclusive and form-like; arrow key behavior per chosen widget pattern |
| A06 | Action menu | trigger + list of commands + separators | opens on Enter/Space; Up/Down/Home/End, Escape closes, focus returns; destructive actions separated |
| A07 | Overflow menu | menu version of low-frequency actions | never hide the only way to accomplish primary task in overflow |
| A08 | Toolbar | grouped commands, optional search and title | roving focus only where ARIA pattern applies; adaptive overflow must preserve command names |

## 2. Input (09–22)
| ID | Component | Anatomy & variants | Interaction / accessibility |
|---|---|---|---|
| F09 | Text field | persistent label, input, helper/error, optional prefix/suffix, clear | label never replaced by placeholder; text selection works; error ID via aria-describedby |
| F10 | Text area | label, expanding editor, count and help | resizable unless product-specific editor; no unexpected autocorrect of data |
| F11 | Search field | label, suggestions, clear, scope, submit | keyboard suggestion list pattern; Escape clears popup first; announce results count |
| F12 | Password | field plus reveal button, strength guidance | reveal state named; caps lock notice optional; no forced clipboard prevention |
| F13 | Checkbox | box, label, description; unchecked/checked/mixed | Space toggles; grouped fieldset/legend; mixed is programmatic |
| F14 | Radio group | circle, label, helper; one checked per group | arrow keys navigate/select in standard grouped radio pattern |
| F15 | Switch | track/thumb + immediate-action label | on/off programmatic state; Space toggles; never for deferred submit form choice |
| F16 | Slider | track, thumb, ticks, value; single/range | arrow/Home/End/Page keys; numerical accessible min/max/now, discrete step announcement |
| F17 | Select | native or accessible listbox | use native select preferentially on mobile; typeahead, Escape, restored focus |
| F18 | Combobox | editable or readonly; list popup | implement recognized ARIA combobox keyboard model; async results cancel stale requests |
| F19 | Date/time picker | editable display and calendar/grid or native system picker | locale format, timezone and DST explicit; no color-only date availability |
| F20 | File picker | drop zone, input, preview, validation | keyboard activation plus browse alternative to drag/drop; show max size/type |
| F21 | Stepper/number | numeric field and +/- buttons | bounds announced; manual entry supported; avoid repeated accidental increments |
| F22 | Form validation summary | heading, linked errors, corrective help | submit focuses summary when blocking, field IDs linked; preserve entered data |

## 3. Containers & data (23–37)
| ID | Component | Anatomy & variants | Interaction / accessibility |
|---|---|---|---|
| C23 | Surface / Card | header, body, action footer; flat, tonal, outlined, clickable | only whole-card click when truly one destination; no nested actionable elements in button |
| C24 | Lens panel | backdrop, fill, edge, optional toolbar | floating navigation/temporary control only; solid fallback; no Lens-in-Lens |
| C25 | List | optional grouped headings, row, metadata, actions | row content supports 2 lines normally; actionable rows have clear destination |
| C26 | List row | leading glyph/media, title, subtitle, trailing affordance | touch zone 44–48; selection indicator independent of hover |
| C27 | Data table | column headers, sorting, selection, bulk actions | native table semantics; headers mapped to cells; sort state announced |
| C28 | Grid | responsive cards, track behavior, gap | DOM reading order must match visual order; avoid masonry trapping keyboard |
| C29 | Tree view | expandable hierarchical items | Left/Right expand/collapse in LTR; home/end; typeahead; selected vs focused distinct |
| C30 | Accordion | heading button, region | Enter/Space toggles; aria-expanded; region labels; multiple/single policy stated |
| C31 | Tabs | tablist, tabs, tabpanels | keyboard Arrow/Home/End, tab to active panel; automatic activation only when latency negligible |
| C32 | Badge/Chip | short label, optional icon, dismiss | status is noninteractive badge; removable chip has independently named remove button |
| C33 | Avatar | image or initials, availability marker | image has useful alt if identifying; status never solely colored dot |
| C34 | Tooltip | concise supplementary text | appears on hover and keyboard focus, Escape dismisses; not essential instructions |
| C35 | Popover | nonmodal interactive overlay anchored to trigger | focus stays sensible; Escape and outside click policy; scroll boundary tracking |
| C36 | Skeleton | placeholders that mirror final geometry | hide decorative skeletons from screen reader; loading status announced once |
| C37 | Charts | visual encoding + legends, source, alt-data | series distinguished by shape/labels, tabular equivalent, keyboard data exploration |

## 4. Navigation & spatial (38–45)
| ID | Component | Anatomy & variants | Interaction / accessibility |
|---|---|---|---|
| N38 | App bar | title, back affordance, actions | at most two high-priority actions exposed on compact widths |
| N39 | Bottom navigation | 3–5 labeled destinations; active marker | never scrollable by default; safe-area inset; selection visible without color |
| N40 | Navigation rail | compact destinations and overflow | for medium widths; labels available on focus/selection or always when space allows |
| N41 | Navigation sidebar | grouped destinations, resizable option | desktop persistent when room; collapse preserves context and scroll position |
| N42 | Breadcrumbs | path links with current item | only for hierarchical spaces; use nav landmark; don't duplicate a back control needlessly |
| N43 | Pagination | current, previous/next, page size | reachable keyboard buttons, current page announced; don't trap focus on page rerender |
| N44 | Command palette | search, grouped suggestions and shortcuts | invoked by discoverable command; Escape returns focus; no hidden essential functionality |
| N45 | Stepper/wizard | step labels, current, completed, blocked | current step announced; users can review; do not lose entered data |

## 5. Feedback & overlays (46–54)
| ID | Component | Anatomy & variants | Interaction / accessibility |
|---|---|---|---|
| O46 | Toast/snackbar | brief message, optional one action | polite announcement, does not steal focus; time limit extends/pauses where necessary |
| O47 | Inline banner | icon, severity, title, description, optional action | semantic intent with text; do not overuse warning color |
| O48 | Alert dialog | heading, summary, primary/cancel | modal focus containment; Escape handling; safe focus initial for irreversible action |
| O49 | Dialog | heading, content, footer actions | max width 560, scroll content not whole viewport; close restores invoking focus |
| O50 | Bottom sheet | drag handle, heading, content/actions | gesture and keyboard equivalent; safe-area inset; predictable dismissal |
| O51 | Side sheet | resizable inspector, close, actions | preferred for tablet/desktop detail; focus order preserves app context |
| O52 | Progress | determinate, indeterminate; bar/ring | role, label and numerical value when known; reduced motion fallback |
| O53 | Empty state | illustration, title, explanation, next step | informative, not celebratory when blocked; one relevant action |
| O54 | Error/retry state | diagnostic summary, action, optional details | distinguish offline, permission, validation, server and destructive failure |

## 6. Media, productivity, and specialized (55–63)
| ID | Component | Anatomy & variants | Interaction / accessibility |
|---|---|---|---|
| M55 | Media player chrome | play, seek, captions, audio, fullscreen | labeled controls; keyboard/media-key support; Lens over imagery with robust scrim |
| M56 | Image viewer | zoom, pan, caption, close | pointer/touch and keyboard equivalents; alt text; avoid scroll-jank |
| M57 | Drag-and-drop item | handle, source, target | reorder actions and keyboard alternative, announcement on relocation |
| M58 | Calendar | month/week/day schedule views | accessible events list alternative; timezone and first weekday localized |
| M59 | Timeline | ordered events and timestamps | list semantics; color+shape status; time format locale aware |
| M60 | Notification center | grouped cards, unread state, actions | clear affordance for read/unread; no focus theft on arrival |
| M61 | Context menu | location-specific commands | keyboard Shift+F10/context-menu key; touch long-press is optional shortcut |
| M62 | Split view | primary and detail panes, resize handle | draggable and keyboard resize, minimum widths and collapse |
| M63 | Onboarding tour | steps, optional spotlight, skip | never block core tasks after first use; no forced motion; progress and dismiss |

## 7. Component geometry defaults
- Button S 36h, M 44h, L 52h; horizontal padding 12/18/24. Default 18px radius; pill only when action category supports it.
- Icon button visible box 36/40/44 and **interactive** zone >=44x44. Icon default 20, prominent 24.
- Field 48h, multiline min 112h; label above, help below, 12 radius.
- Navigation row 44–52h, gap 12; mobile dock 56–64h plus safe area. Tab strip 44h minimum.
- Card padding 16/24/32 at compact/expanded/wide; default radius 26. Dialog radius 36, max width 560, max-height constrained by visual viewport.
- Menu item 40h pointer, 48h touch, padding inline 12–16. List row >=48h default.
- Tooltip 8px radius; toast 18px; popover 18–26px; sheet top 26–36px.
- No arbitrary component shadows: resolve through E0–E4 depth tokens.

## 8. Interaction protocol
- Escape priority: close innermost popup -> dialog -> expanded side overlay, never leave a focus trap.
- A dialog **locks** underlying interaction; a popover **does not**.
- Disabled controls do not receive activation; a disabled control's explanation must be otherwise discoverable.
- All asynchronous actions have pending/busy, success/failure, timeout and retry semantics; cancel pending promises after unmount.
- Destructive actions: confirmation proportional to reversibility and blast radius, no overuse for undoable low-risk actions.
- Focus management on route changes depends on app model; SPA updates announce heading and intentionally move focus only for navigation, never for transient toast.
- Loading labels and button dimensions remain stable; no infinite "Saving…" without failure or recovery path.
