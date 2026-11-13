# Optional atmospheric glass utilities (alpha)

Import `@goreecloud/ui/tokens.css` and `@goreecloud/ui/components.css` before the optional `src/glass.css` stylesheet. The latter is available from source on the review branch; it is **not yet a published package export**. It provides opt-in CSS classes, not new material tokens or mandatory color choices.

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

**Verification limits:** The Node contract tests check stylesheet invariants; CI browser smoke tests are not a complete matrix for these new classes. Before publication, verify computed styles and real contrast across light/dark, reduced transparency, forced colors, zoom and multiple compositing backdrops. This change does not assert WCAG certification or native platform integration.
