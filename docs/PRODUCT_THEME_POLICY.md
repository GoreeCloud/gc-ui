# GoreeCloud product color and preference policy

**Status:** proposed implementation in the GC UI development branch; not a released or ecosystem-wide verified migration. The existing Foundations 1.0.1 stable artifact is unchanged.

## Mandatory appearance baseline — founder direction (2026-10-29)

**Scope and authority.** As GoreeCloud's founder, I require **every GoreeCloud application**—across supported web, desktop, and mobile clients—to **use the light theme by default**. I require users to be able to change the appearance at any time through their application settings. This is a founder-directed product requirement for future development and conformance assessment, not evidence that all consumers already comply. [GC UI](../README.md) remains the sole GoreeCloud design-system authority; this appearance requirement is distinct from an application's suggested accent color.

**Required appearance behavior:**

1. **First launch / no saved selection:** Render the **light** appearance even when the host operating system currently prefers dark mode. Invalid, missing, or cleared stored appearance preferences fall back to light.
2. **User control:** Offer a discoverable, accessible appearance control in application settings. Users may select **Light** or **Dark** whenever they wish; changes should apply immediately without requiring a restart wherever the platform permits.
3. **Preference precedence and persistence:** A valid, explicit user-selected appearance takes precedence over the default, persists across ordinary app restarts/sessions using the product's approved preference storage, and is not silently replaced by OS appearance changes.
4. **Optional automatic mode:** An app may offer **Auto / Follow system** as an additional *explicitly user-selected* option. Auto is **not** the first-run default. Once chosen by the user, Auto follows host appearance changes until the user chooses something else or clears the selection.
5. **Reset behavior:** Resetting appearance to its unspecified state restores the GoreeCloud **light** default. Do not mistake a product's suggested accent for a stored user appearance choice.
6. **Accessibility and privacy:** Preserve high-contrast, forced-colors, reduced-transparency and other applicable accessibility protections independently of light/dark selection. Do not assume cross-device preference synchronization; synchronization requires its own verified, privacy-aware design and authorization.

**Implementation guidance and acceptance.** The shared GC UI theme contract and every participating app need implementation and regression checks for (a) a clean profile with a dark-preferring OS still showing Light, (b) switching Light ↔ Dark in Settings without loss of access or focus, (c) retained explicit choice after restart, (d) explicitly opted-in Auto following OS changes, (e) a reset returning to Light, and (f) accessible contrast and forced-color behavior. Test each declared supported platform. App-by-app rollout, release and deployment require independent verification.

**Current-state gap (verified from repository source on 2026-10-29):** [`src/gc-theme-runtime.mjs`](../src/gc-theme-runtime.mjs) currently defines `GC_THEME_DEFAULTS.mode = 'auto'`, and [`src/main.js`](../src/main.js) uses the host's `prefers-color-scheme` on an unset mode. Those existing alpha behaviors may resolve to Dark with no saved user choice and **do not yet satisfy this newly documented light-first requirement**. This document changes the required target behavior only; it does not modify runtime code, migrate apps, or certify compliance.

See [GC UI appearance and theme specification](COLOR_THEMES.md#5-appearance-and-precedence) for the corresponding design contract.

## Design identity

GoreeCloud UI (GC UI) owns the shared semantic tokens, typography, navigation, spacing, component states, elevation and accessibility behaviors. Product personalities select semantic roles, not hardcoded UI colors. The ecosystem fallback accent is **Neutral** (slate, not violet). Purple **Iris** remains an opt-in palette.

| Consumer | Product-suggested accent when no user choice exists | Notes |
| --- | --- | --- |
| Core GC UI and unspecified products | Neutral | Baseline, no mandatory accent hue |
| GoreeCloud Messenger | Ocean | Expressive blue communication UI |
| GoreeCloud Notify | Lagoon | Calm teal notification UI |
| GoreeCloud DNS | Moss | Green network filtering, when a UI exists |
| Wardveil / GoreeShield / security products | Neutral | Semantic warnings and dangers retain meaning |
| Other products | Neutral | Specific product suggestions require scoped review |

These are **defaults or proposals**, not evidence of migration for each consumer.

## Preference precedence

1. A validated **explicit saved user accent** takes precedence over product suggestions.
2. Accessibility settings (forced colors, high contrast, reduced transparency) govern accessibility-dependent rendering independently of accent preference.
3. If no valid user accent exists, an application's validated `defaultAccent` suggests its product identity.
4. If no product suggestion exists, use `neutral`.

Changing *appearance* (light/dark) must not freeze the suggested accent into storage as if the user selected it. Resetting an app accent restores its product suggestion. Never sync cross-origin theme preferences without an explicit, privacy-aware design and user authorization.

## Implementation guidance

- Use `--gc-v1-color-primary`, `--gc-v1-color-on-primary`, `--gc-v1-color-primary-container` and other GC UI roles rather than literal brand colors in components.
- Prefer a versioned first-party GC UI package. Until one is available for every target, consumers may include a local, attribution-preserving offline semantic CSS snapshot (see `integrations/themes/gc-app-semantic.css`), and should track a single source for updates. Snapshot consumers must not claim package-based migration.
- The alpha v1 preview uses `styles/gc.v1.product-palettes.css` after the versioned generated stylesheet; existing generated base values and the stable Foundations artifact have **not** been rewritten in this change.
- Preserve shared typography, geometry, iconography, surface hierarchy, navigation and interaction styles. Accent should not be the only distinction between information states.
- Test light/dark, forced-colors, high contrast, text contrast, focus and persisted user preference precedence for each consumer.
- Audit compiled CSS for remaining app-specific purple literals, including gradients and selected-state decorations; migration is not complete until visual and functional checks pass.

## Acceptance

An application is accepted only after its compiled runtime uses the approved semantic token contract, the user can override and retain their accent, default appearance is contrast-accessible, and the change passes app-specific CI and visual review. Repository changes alone do not establish deployment.

## Centralized experimental product profiles (2026-10-29)

The alpha source exports `getProductAccent(product)`, `GC_PRODUCT_ACCENTS`, and
`createProductThemeController({product,...options})` from
`src/gc-product-themes.mjs` and the experimental `src/index.mjs`.

Example (inside a first-party web application that has already integrated the
matching GC UI CSS roles):

```js
import {createProductThemeController} from '@goreecloud/gc-ui'; // future versioned package entry
const controller = createProductThemeController({product:'messenger'});
// With no saved accent, Messenger suggests Ocean blue. A saved Iris choice wins.
// controller.set({accent:'iris'}) is an explicit user selection only.
```

The package name above is illustrative for an eventual verified distribution;
the current full workspace remains private alpha and is **not a confirmed npm
registry installation**. Direct source consumers can import the experimental
`src/gc-product-themes.mjs` from a pinned, verified first-party revision.

The app-local offline snapshot `integrations/themes/gc-app-semantic.css` has
an automated contract test covering GC UI base surfaces, curated palettes,
neutral/Ocean overlays, and light/dark primary contrast. Vendors should retain
source provenance and verify their copied snapshot against a pinned GC UI
revision, rather than independently editing product hex values. Do not include
remote browser CDN dependencies that could delay, block, or alter login UI.

Before general release, the v1 canonical token registry and generated stylesheet
must be brought into neutral-first alignment and all consumers must pass real
rendered/forced-color accessibility review. The alpha compatibility overlay
is not a substitute for a formally qualified versioned token release.
