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
