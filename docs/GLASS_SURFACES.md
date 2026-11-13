# Optional atmospheric glass utilities (alpha)

Import `@goreecloud/ui/tokens.css` and `@goreecloud/ui/components.css` before the optional `@goreecloud/ui/glass.css` stylesheet. The package export is defined on this review branch but is **not yet released**. It provides opt-in CSS classes, not new material tokens or mandatory color choices.

| CSS class | Intended use | Existing material mapping |
| --- | --- | --- |
| `.gc-glass-base` | Persistent navigation and supporting panels | Cloud Surface / Cloud Lens |
| `.gc-glass-elevated` | Elevated cards and toolbars | Cloud Surface / Cloud Lens |
| `.gc-glass-overlay` | Transient popovers and dialog panels | Cloud Lens; consumer supplies modal scrim and focus handling |
| `.gc-glass-solid` | Dense reading, sensitive content and fallback | Cloud Surface |

Each class is **opaque by default**. To request translucency on a supported device, add `data-gc-translucent="true"` to a base/elevated/overlay element. Example:

```html
<aside class="gc-glass-base" data-gc-translucent="true" aria-label="Workspace navigation">
  <!-- Use semantic, keyboard-operable controls inside -->
</aside>
```

The stylesheet uses existing semantic surface, outline, shadow and blur tokens. It does not impose navy, blue or any other brand hue. Do not put critical content over unpredictable imagery or translucent backdrops. Prefer solid materials for dense text, privacy controls, security alerts and unsupported platforms.

Reduced transparency, increased contrast, forced colors, and the explicit `data-gc-contrast="more"` mode disable blur and restore opaque surfaces. Forced colors additionally use system color keywords. Consumers still own semantic dialog behavior, scrims, Escape/focus management, real data state, responsive layout and manual accessibility review.

## Explicit reduced-transparency preference

Consumers can offer an accessible, in-app transparency preference even when the
browser does not implement the `prefers-reduced-transparency` media query.
Import `applyTheme` from `@goreecloud/ui/theme` and request
`transparency: "reduce"`, or set
`data-gc-transparency="reduce"` on the root element. Example:

```js
import { applyTheme } from "@goreecloud/ui/theme";
applyTheme(document.documentElement, {
  mode: "auto", accent: "lagoon", transparency: "reduce"
});
```

The default is `transparency: "auto"`, which restores system-driven behavior.
The theme controller also supports `update({ transparency: "auto" })` without
storage or telemetry. An unknown value is rejected before changing theme attributes.
This optional setting affects the four glass utility roles when
`@goreecloud/ui/glass.css` is loaded; it is **not** a promise that unrelated
native, operating-system, or product surfaces become opaque. A consuming app is
responsible for its settings UI, user consent, persistence (if desired),
and contrast verification. Do not rely on preference CSS to replace meaningful
solid surfaces for credentials, long-form text, or security/privacy alerts.

**Verification limits:** The Node contract tests check stylesheet invariants; CI browser smoke tests are not a complete matrix for these new classes. Before publication, verify computed styles and real contrast across light/dark, reduced transparency, forced colors, zoom and multiple compositing backdrops. This change does not assert WCAG certification or native platform integration.
