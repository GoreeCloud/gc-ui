# GoreeCloud UI — Forms and Search Reference Contract

**Status:** experimental web treatments. No stable component APIs or framework-specific adapters are declared.

**Reference:** `lab/forms.html`, `lab/forms.mjs`, `lab/forms.css`, and exported `styles/gc.v1.components.css`. The machine-readable catalog is the authority for pattern maturity.

## Implemented patterns

| Code | Pattern | Web treatment |
|---|---|---|
| F10 | Text area | Native `<textarea>` with persistent label, 10–280 character example constraint, independent counter, vertical resizing and error description |
| F11 | Search field | Native search input enhanced as a named ARIA combobox with listbox suggestions, tracked active option, clear action and polite results count |
| F12 | Password | Native password input, intentional Show/Hide toggle with stable accessible name and `aria-pressed`, no persistence |
| F17 | Select | Native labeled `<select>`, keyboard/touch semantics preserved and a local-only result status |
| F21 | Stepper/number | Native bounded `type="number"` (1–12), manual edits and +/- buttons, disabled controls at bounds |
| O54 | Error/retry state | Informative `role="alert"` for simulated failure, explicit retry and polite recovery confirmation |
| F22 | Form validation summary | Named focusable group with links to all blocking errors, per-field `aria-invalid`, error/help relationships and preserved entries |
| O53 | Empty state | Explanatory heading, status context and one clear-filter action when search yields no matching sample results |

All examples run entirely in the browser. They do not fetch or store workspace content.

## Progressive controller mounting

The experimental number stepper's initial normalization invokes the host
`onChange` callback before any click/change listeners are installed. If
that callback throws, the mount fails **without ghost event handlers** and
restores the pre-mount numeric input value and borrowed button disabled
states unless the host changed those values afterward. A later mount can
safely retry. Established controllers retain the existing native semantics.
This does not imply stable component API status.

## Field validation contract

- Visible labels are persistent and associated with native inputs through `for` / `id`.
- Empty submit validates all fields, makes `#brief-errors` visible, and focuses that summary. Links jump focus to the corresponding invalid field.
- `aria-invalid="true"` and the corresponding error ID are present only while invalid. Once corrected, the field returns to its original help IDs. Notes counter remains a separate described value.
- A successful local validation shows an explicit message without sending data or silently discarding form entries.
- Application validation must not rely solely on the decorative color of an input border.

## Experimental extracted validation controller

`initValidationSummary(form, summary, list, fields, {onValid, onInput})` is now
an optional, typed **experimental** controller for native field validation and
focusable linked errors. Each field supplies its native input, visible error
element, human-readable label, and synchronous validator. The summary is a
`role=group`, `tabindex=-1` element containing an initially empty `<ul>`.
Validation happens locally; controller code never submits or saves a value.
It builds error links through DOM text nodes (not HTML parsing), places focus on
the summary after failed submission, and revalidates a previously invalid field
as the user edits. Application-owned descriptions, ARIA, and error visibility
are restored on teardown where the controller still owns its last writes.
If a host adds or replaces `aria-describedby` hints after mounting (including
before the first validation), validation preserves those current help IDs and
cleanup does not resurrect stale hints.
Host applications own the success message and any async/network submission.
If an application `onInput` callback or synchronous field validator disposes the
controller during an input event, its old handler stops immediately; it must
not restore errors, ARIA state, or summary markup after the host unmounts it.
The unit and native-browser regressions exercise disposal with pre-existing
host-owned invalid state. This extraction does not mark F22 or the whole GC
UI workspace stable.

**Truthful action and result copy:** The Forms Lab action is **Check brief**, because the specimen validates local fields but creates, submits, and saves no project. The success status is **Brief checks passed**, followed by the explicit statement that no data has been submitted or saved. The disabled, no-JavaScript control and its explanation use the same action label. These are observable UX semantics, not proof of production form submission or persistence.

## Search keyboard contract

- Typing filters six illustrative project names and updates a `role="status"` result count. The popup is named as a `role="listbox"`, with keyboard-active rows given `role="option"` and `aria-activedescendant`.
- `ArrowDown` and `ArrowUp` cycle currently filtered suggestions while DOM focus remains on the input.
- `Enter` selects the active suggestion, or closes an open suggestion list without changing the query.
- `Escape` closes the suggestion list first. When no suggestion list is open, another Escape clears the query.
- The clear button and empty-state reset both restore the complete result list and focus the search input.
- No user-authored search data is inserted through HTML parsing: example result and suggestion nodes use `textContent` and DOM creation.
- IME composition defers filtering and prevents Enter/Escape navigation while the browser is composing characters. `compositionend` re-renders results and suggestions without selecting anything on behalf of the user.

## Visual and platform behavior

- All form-specific **reusable** CSS classes belong to `styles/gc.v1.components.css`. The `lab/forms.css` file provides only specimen-page layout.
- Labels, error boundaries, focus outlines and result messages use GC UI semantic color roles. There are forced-colors fallbacks and no dependence on translucent surfaces for long text.
- The specimen switches from a two-column layout to a single column at compact widths; text areas remain resizable and respect the containing width.
- Browser interaction tests verify 320px layout, dark preferences, form recovery, combobox keyboard movement, and empty-state reset.
- Automated axe A/AA scans exercise baseline and invalid-summary/suggestions states. They provide **a screening result, not WCAG conformance**.

## Remaining release gates

Manual VoiceOver, TalkBack and NVDA testing; mobile virtual keyboard behavior; IME composition; large translated strings and RTL typing; error-summary verbosity; slow-network/async search for a real data-backed consumer; and visual approval remain incomplete.

This work does **not** convert F10, F11, F12, F17, F21, F22, O53 or O54 to stable. The catalog can declare them experimental once coded behavior, accessible example, and automated tests are present.

## Review-driven usability corrections
The focus-only skip link is supplied by `styles/gc.v1.components.css`, and the Chromium/WebKit built-in search cancel glyph is hidden in the experiment so there is exactly one intentionally labeled clear control. These are supported by source and browser regressions; the broader app-specific search accessibility contract still requires live screen-reader review.

## Password, native select, numeric and recovery contracts

- F12 is explicitly an invented sample passphrase field. The Show/Hide button has a stable accessibility name (`Reveal sample passphrase`) and uses `aria-pressed` to report the reveal state; changing the type preserves the field value. No actual credential should be entered. Never store or transmit the value.
- F17 prefers the platform-native select for mobile typeahead and accessible option behavior; selection changes only the local demonstration status.
- F21 allows manual numeric input as well as 48px minimum increment/decrement controls. The specimen normalizes out-of-bounds numbers on change, updates the label/status in a live region and disables buttons at the configured minimum/maximum.
- O54 explicitly distinguishes a simulated connection failure from actual network traffic. The alert offers one effective retry action. Successful retry hides the error, exposes confirmation as a polite status and returns focus to the stable Simulate button. Existing form content remains untouched.
- These four references are tracked as **experimental** in the catalog; `lab/forms.mjs` retains specimen orchestration; password reveal and bounded number-stepper behavior are **experimental typed exports** from `src/gc-form-controls.mjs`, not stable production APIs.

The shared `.gc-skip-link` stays at an absolute negative block position while idle and becomes a fixed positive-position link only on keyboard focus. This avoids misleading full-page screenshot artifacts after page scroll while retaining visible keyboard skip navigation.

## Extracted experimental controller layer
F12 and F21 now use `initPasswordReveal` and `initNumberStepper` from `src/gc-form-controls.mjs`, exported through `src/index.mjs` with declarations in `types/index.d.ts`. The password controller demands a stable accessible name, preserves the value when toggling, and re-masks it on teardown. The bounded integer stepper rejects invalid range contracts, clamps typed values on change, updates disabled endpoints, and unsubscribes on teardown. On view disposal, the password controller always re-masks the input and restores host-owned
`aria-pressed` and any original plain-text label only when the controller's last value is still
present. A button with nested icons is **never** replaced through `textContent`; to display
Show/Hide alongside an icon, put the mutable **text-only** label in a descendant marked
`data-gc-password-reveal-label`. Unmarked child markup remains untouched. Steppers restore
pre-init disabled flags only for buttons still holding their controller-written states. When an application `onChange` callback rejects a later update by throwing, the controller rolls back the input to the last accepted value (including after manual typing) and restores the prior boundary-button states. A callback's newer host-owned value or button changes are preserved instead of being overwritten during rollback. If a rejecting callback performs a newer accepted nested stepper update, the older rejection also leaves that newer input value and boundary disabled state intact.
A new nested-SVG browser regression verifies actual DOM ownership and focus behavior;
the root GC UI workspace remains experimental and not certified for credential handling. Source and browser regressions cover the specimen and direct lifecycle. Search suggestions, native select status, and simulated retry remain lab-only behavior; form error-summary validation is available as an experimental exported controller, but its original lab orchestration remains a specimen. See [Web API alpha](WEB_API_ALPHA.md).

## Experimental density preview

The native Workspace density select in Forms Lab now changes a bounded
`data-gc-density` signal on the document root. Compact and Spacious vary field
gaps and panel/card whitespace while native input and action targets keep
their original 44–48 CSS-pixel minimums. Comfortable remains the default.
This selection is local to the reference page and is **not persisted** or
exposed as a stable GC UI theme/controller API. Browser-based reflow and
assistive-technology review are still required for consumer applications.
