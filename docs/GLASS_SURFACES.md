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

Reduced transparency, increased contrast, forced colors, and the explicit `data-gc-contrast="more"` mode disable blur and restore opaque surfaces. **Forced colors always retains final precedence**, including when an app simultaneously requests `data-gc-transparency="reduce"`: the rendered foreground, background, and borders use system `CanvasText`/`Canvas` rather than the app's semantic glass colors. This combined preference is covered by Chromium computed-style checks; it does not prove full screen-reader or device certification. Consumers still own semantic dialog behavior, scrims, Escape/focus management, real data state, responsive layout and manual accessibility review.

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
This setting now affects the four glass utility roles when
`@goreecloud/ui/glass.css` is loaded **and** existing `.gc-lens` and
`.gc-bottom-nav` Cloud Lens surfaces via
`@goreecloud/ui/components.css`. Dialog and command-palette backdrop blur
is also disabled. The default `"auto"` leaves existing visual treatment
untouched. Forced-colors `Canvas` / `CanvasText` has final precedence,
including if the app simultaneously selects manual reduction. This is **not**
a promise that unrelated native, operating-system, or product surfaces become
opaque. A consuming app is
responsible for its settings UI, user consent, persistence (if desired),
and contrast verification. Do not rely on preference CSS to replace meaningful
solid surfaces for credentials, long-form text, or security/privacy alerts.

## Accessible alpha demo control and browser evidence

The isolated `tests/glass-browser.html` **review fixture** includes a native,
keyboard-operable **Reduce transparency** checkbox. It updates the local
`createThemeController` in memory, announces a plain-language status, and
restores `"auto"` when unchecked. Reloading resets the demo; it does not
persist preferences or enable an app-wide settings contract.

Real Chromium tests check checkbox/label semantics in the accessibility tree,
Space-key activation and focus preservation, reduced and restored blur,
reversibility, and no unexpected persistence. At compact 320px and 390px
viewports, browser geometry tests additionally require the preference label and
status not to overlap and the document not to overflow horizontally.

**Visual acceptance scope:** The screenshots
`gc-ui-glass-preference-320.png` (light) and
`gc-ui-glass-preference-390.png` (dark) were manually inspected after a
mobile layout correction; the label, large native checkbox, and separate
supporting status are readable with purposeful spacing. These screenshots
do not replace actual human assistive-technology, operating-system, or native
application acceptance.

## Full design lab integration

The `lab/` alpha demonstration now includes a local **Reduce transparency**
switch alongside its existing Appearance, Accent and More Contrast settings.
It uses the same nonpersistent `createThemeController`, without changing
brand tokens or involving GoreeShield, Identity or Mesh service operations.
It applies to the lab's normal Cloud Lens toolbar and floating navigation,
not just the isolated four-material test fixture.

Chromium checks at 320px light and 390px dark confirm immediate opaque
backgrounds and no backdrop blur; unchecking restores original computed
styles. Additional forced-colors checks enforce the OS system palette,
and verify unchanged local storage and cookies. The tests check page
horizontal overflow but do not certify real touch/OS screen readers.
**This is a review-branch capability; no production rollout occurred.**

## Worst-case opaque-backdrop text-contrast guard

The review branch includes `scripts/glass-contrast-guard.mjs`, a dependency-free
QA utility (not a public browser export) for **opaque CSS text over one RGBA
glass fill**, with any fully opaque sRGB background. It computes the minimum
WCAG relative-luminance contrast over the entire RGB backdrop cube using the
monotonic bounds of sRGB alpha blending. Rather than testing just one gradient,
it rejects any color pairing whose modeled worst case drops below **4.5:1**.

```js
import { assertGlassTextContrast } from "./scripts/glass-contrast-guard.mjs";

const result = assertGlassTextContrast(
  "rgb(27, 32, 48)", "rgba(255, 255, 255, 0.84)", 4.5
);
// Throws on low contrast or unsupported/transparent foreground colors.
```

Chromium `browser:smoke` now feeds **computed** foreground and background
colors from all four material roles into the guard in light/dark, high contrast,
reduced-transparency, forced-colors and manual-preference scenarios. The
browser runner also sweeps Iris, Lagoon, Ember and Moss in both light and dark,
checking all four material roles for modeled 4.5:1 normal-text contrast and
verifying that distinct accent selection remains functional. It fails closed
for unsupported CSS color formats, which must be audited separately.

**Limitations:** The calculation assumes one uniform RGBA surface, opaque
foreground text, a fully opaque sRGB backdrop, and standard alpha compositing.
It does **not** establish pixel-perfect screenshot contrast, accuracy under
nested translucent surfaces, blend modes, shadows, non-sRGB color spaces,
complex glyph anti-aliasing, imagery/art direction, nontext indicators, real
hardware performance, or screen-reader acceptance. Consumer-specific visual
and accessibility audits remain mandatory, especially over high-detail media.

**Verification limits:** The Node contract tests check stylesheet invariants; CI browser smoke tests are not a complete matrix for these new classes. Before publication, verify computed styles and real contrast across light/dark, reduced transparency, forced colors, zoom and multiple compositing backdrops. This change does not assert WCAG certification or native platform integration.
