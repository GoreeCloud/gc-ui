# GoreeCloud UI — Forms and Search Reference Contract

**Status:** experimental web treatments. No stable component APIs or framework-specific adapters are declared.

**Reference:** `lab/forms.html`, `lab/forms.mjs`, `lab/forms.css`, and exported `styles/gc.v1.components.css`. The machine-readable catalog is the authority for pattern maturity.

## Implemented patterns

| Code | Pattern | Web treatment |
|---|---|---|
| F10 | Text area | Native `<textarea>` with persistent label, 10–280 character example constraint, independent counter, vertical resizing and error description |
| F11 | Search field | Native search input enhanced as a named ARIA combobox with listbox suggestions, tracked active option, clear action and polite results count |
| F22 | Form validation summary | Named focusable group with links to all blocking errors, per-field `aria-invalid`, error/help relationships and preserved entries |
| O53 | Empty state | Explanatory heading, status context and one clear-filter action when search yields no matching sample results |

All examples run entirely in the browser. They do not fetch or store workspace content.

## Field validation contract

- Visible labels are persistent and associated with native inputs through `for` / `id`.
- Empty submit validates all fields, makes `#brief-errors` visible, and focuses that summary. Links jump focus to the corresponding invalid field.
- `aria-invalid="true"` and the corresponding error ID are present only while invalid. Once corrected, the field returns to its original help IDs. Notes counter remains a separate described value.
- A successful local validation shows an explicit message without sending data or silently discarding form entries.
- Application validation must not rely solely on the decorative color of an input border.

## Search keyboard contract

- Typing filters six illustrative project names and updates a `role="status"` result count. The popup is named as a `role="listbox"`, with keyboard-active rows given `role="option"` and `aria-activedescendant`.
- `ArrowDown` and `ArrowUp` cycle currently filtered suggestions while DOM focus remains on the input.
- `Enter` selects the active suggestion, or closes an open suggestion list without changing the query.
- `Escape` closes the suggestion list first. When no suggestion list is open, another Escape clears the query.
- The clear button and empty-state reset both restore the complete result list and focus the search input.
- No user-authored search data is inserted through HTML parsing: example result and suggestion nodes use `textContent` and DOM creation.

## Visual and platform behavior

- All form-specific **reusable** CSS classes belong to `styles/gc.v1.components.css`. The `lab/forms.css` file provides only specimen-page layout.
- Labels, error boundaries, focus outlines and result messages use GC UI semantic color roles. There are forced-colors fallbacks and no dependence on translucent surfaces for long text.
- The specimen switches from a two-column layout to a single column at compact widths; text areas remain resizable and respect the containing width.
- Browser interaction tests verify 320px layout, dark preferences, form recovery, combobox keyboard movement, and empty-state reset.
- Automated axe A/AA scans exercise baseline and invalid-summary/suggestions states. They provide **a screening result, not WCAG conformance**.

## Remaining release gates

Manual VoiceOver, TalkBack and NVDA testing; mobile virtual keyboard behavior; IME composition; large translated strings and RTL typing; error-summary verbosity; slow-network/async search for a real data-backed consumer; and visual approval remain incomplete.

This work does **not** convert F10, F11, F22 or O53 to stable. The catalog can declare them experimental once coded behavior, accessible example, and automated tests are present.

## Review-driven usability corrections
The focus-only skip link is supplied by `styles/gc.v1.components.css`, and the Chromium/WebKit built-in search cancel glyph is hidden in the experiment so there is exactly one intentionally labeled clear control. These are supported by source and browser regressions; the broader app-specific search accessibility contract still requires live screen-reader review.
