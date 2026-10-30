# GC UI — Optional Pattern Workbench

**Status:** experimental web references; **not included** in the scoped stable
Foundations 1.0.1 distribution, and not a new stable maturity rating for the
63-pattern canonical catalog.

## Scope

The [workbench](../lab/pattern-workbench.html) combines original GoreeCloud
semantic tokens and opt-in [licensed third-party glyphs](THIRD_PARTY_ASSETS.md).
The borrowed SVG *geometry* is attributed; the components, behaviors and
styles are authored as GC UI implementation. All interactions work offline
and no third-party JavaScript UI library is automatically imported.

| Pattern | Reference | Behavior / accessibility contract |
| --- | --- | --- |
| Single-select choice chips | `initChoiceChips`, `.gc-pattern-chips` | native buttons, one `aria-pressed=true`, Enter/Space, disabled choices skipped, retained host ARIA on teardown; rejected `onChange` rolls back the previously accepted choice without clobbering newer host ARIA; optional programmatic focus occurs only after acceptance while the selected button remains enabled, attached, and controller-owned |
| Single-open disclosure group | `initDisclosureGroup`, `.gc-pattern-disclosures` | native `details`/`summary`; progressive enhancement; no scripted focus trap; one open at a time when JS enabled |
| Status note | `.gc-pattern-alert` | message always present, semantic text and decorative SVG |
| Local progress | `.gc-pattern-progress` | native `<progress>` with visible associated label and live text feedback |
| Sample utility tiles | `.gc-pattern-tile` | responsive flat surfaces; decorative imagery never conveys required state |

## App use

Import from the experimental workspace entry point (not from the limited
Foundations stable tarball):

```js
import {initChoiceChips,initDisclosureGroup} from '@goreecloud/gc-ui';
import '@goreecloud/gc-ui/css/patterns';

const chips = initChoiceChips(document.querySelector('[data-chip-group]'), {
  onChange: value => console.log('Selected filter:', value)
});
const disclosures = initDisclosureGroup(document.querySelector('[data-faq-group]'));
// Destroy on view unmount:
chips.destroy();
disclosures.destroy();
```

Buttons must have `type="button"` and unique nonempty `data-gc-choice` values.
Use a labelled `role="group"` around them. Use actual
`details` children with a `summary` in disclosure groups; content remains
readable without JavaScript. The disclosure controller does **not** restore
obsolete open/closed state on teardown: native user choices intentionally
remain. Choice chips **do** restore original `aria-pressed` values where
the controller still owns them, protecting changes made later by the app.

Import `@goreecloud/gc-ui/css/patterns` explicitly to avoid adding global
payloads to unrelated apps. Styles depend on GC semantic color tokens and
provide forced-colors, keyboard focus and narrow-viewport fallbacks.
An icon-only action still needs its own accessible label; third-party
symbols are not accessible names and must not be branded as original GC art.

## Motion extension

`surfaceEnter`, `surfaceExit`, `press` and `nudgeInline` are four bounded
additions to the existing Web Animations preset API. The library never inserts
timers that block DOM state. All are suppressed when motion is reduced or
forced/high-contrast preferences request stillness. `nudgeInline` mirrors
its movement in RTL. Only use entry/exit presets once the actual state is
updated: dismissing a logical element must **not** depend on an animation
finishing.

## Verification

The continuous checks cover deterministic third-party sprite generation,
source paths, license inclusion, the experimental package export, choice
controller teardown and validation, native disclosure behavior, Chromium and
Firefox interactions, axe automated A/AA screens, zoom and RTL reflow.
Automated checks are not WCAG certification, real-device proof or downstream
consumer acceptance.
