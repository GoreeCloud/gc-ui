# GoreeCloud product color and preference policy

**Status:** proposed implementation in the GC UI development branch; not a released or ecosystem-wide verified migration. The existing Foundations 1.0.1 stable artifact is unchanged.

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
