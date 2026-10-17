# GC UI Experience Studio — Semantic Depth, Original Scenes & Platform Profiles

**Status:** Experimental alpha implementation; not an approved native SDK, a physics simulation, an accessibility certification, or a production component library.

## Purpose
This phase extends the GC UI Canvas / Surface / Lens foundation without displacing it. The goal is a more expressive, usable language for product scenes, balanced depth, and short spatial transitions. Material effect is subordinate to information legibility, keyboard focus, performance and explicit accessibility preferences.

[Open the Experience Studio](../lab/experience-studio.html).

## Original contextual illustration vocabulary
Three new GC UI-authored vector illustrations appear in [gc-scenes.svg](../assets/gc-scenes.svg):

| Scene | Expression | Recommended context |
|---|---|---|
| Workspace | Rounded application frame, sections and progress trend | Creation, overview, multitasking |
| Reading | Open book with stable typographic lines | Long-form text, tutorials, focus |
| Analysis | Columns and analytic trend | Data, comparisons, monitoring |

They are designed with semantic currentColor and opacity so they inherit suitable colors in SVG context. The surrounding CSS supplies safe tonal color rather than hardcoded brand tints. Illustrations are decorative when descriptive copy is already adjacent; if a scene becomes informative in another application, supply concise text equivalent. Source SVG is original GC UI work, not copied from a commercial asset provider.

## Material depth as geometry, not decorative simulation

| Tier | Semantic role | Rendering |
|---|---|---|
| E0 | Atmospheric grouping/background | Tonal surface, no shadow |
| E1 | Ordinary content | Small, grounded separation |
| E2 | Active task plane | Stronger edge and moderate elevation |
| E3 | Rare transient/foreground plane | Maximum bounded elevation |

E4 remains part of the broader normative design vocabulary but is deliberately **not implemented by this web Studio**; it is reserved for future host-controlled modal cases. The pure [depth resolver](../src/gc-material-depth.mjs) caps depth based on workspace, reading, analysis, media, explicit low-power mode, and contrast preferences. Reading is capped at E1; analysis at E2 with shadows suppressed. High contrast or forced colors collapses effect to E0 with visible boundaries. Low power reduces elevation and decoration. CSS in [gc.v1.depth.css](../styles/gc.v1.depth.css) never animates the backdrop, tracks the pointer, calls a sensor, or applies physics-based parallax. Material physics here means consistent static optical depth constraints, **not physical lighting simulation**.

## Choreography contract
[createChoreography](../src/gc-choreography.mjs) groups at most three visible related elements and offsets their existing GC motion presets by 0–45ms each. It cancels an older group when a new one begins and removes fills after animation. DOM/focus is already valid before any animation runs. Reduced motion, forced colors, high contrast and missing Web Animations support skip animation. If these preferences change while the choreography is in progress, the controller cancels active animations immediately. Motion cannot be required to understand a status or transition.

## Platform profiles: web contracts, not native SDK adapters

[GC_PLATFORM_PROFILES](../src/gc-platform-profile.mjs) lists seven explicit **design profiles**: web, phone, tablet, desktop, tv, wearable and spatial.

These suggest touch target minimums, navigation posture, focus cues, default depth budget, motion and Lens use. They do **not** call platform haptics, sensors, native Android/iOS UI frameworks, spatial SDK APIs, remote key events, crown input, or TV focus engines. Profiles are chosen by the application/design tool. Hardware detection and platform-native binding must be implemented and verified separately.

| Profile | Target guidance | Navigation/focus guidance |
|---|---:|---|
| Web | 44px | Adaptive, visible keyboard focus |
| Phone | 48px | Bottom navigation, bounded Lens |
| Tablet | 48px | Rail, bounded Lens |
| Desktop | 44px | Sidebar, keyboard focus |
| Television | 64px | Directional focus, solid Lens |
| Wearable | 48px | Glance-first, minimal material |
| Spatial | 48px | Host-managed native focus and material |

Profiles preserve explicit high contrast, reduced motion, reduced transparency and low power overrides. None grants permission to use native platform intellectual property. Native adapters are a future integration/QA project rather than something implicitly working in a browser.

## Usage

- Add [gc.v1.generated.css](../styles/gc.v1.generated.css), [gc.v1.materials.css](../styles/gc.v1.materials.css), and [gc.v1.depth.css](../styles/gc.v1.depth.css) in order.
- Resolve material depth, then apply a data-gc-depth attribute (e0, e1, e2, e3) to a .gc-depth-surface.
- Use resolvePlatformProfile() to choose a design contract; feed actual native capability signals from a trusted host integration rather than the user-agent string.
- Mount illustrations as local SVG use symbols; ensure source files are packaged and referenced with resolved paths.
- Use createChoreography() only when a group transition improves spatial continuity; call destroy() on teardown.

## Release gates
A passing automated suite is not permission to deploy arbitrary Lens, media gradients or extended animations. Remaining gates include real composited text contrast measurement, low-end GPU/power profiling, Safari testing, native SDK integration, physical keyboard/remote/rotary input, TalkBack/VoiceOver/Orca manual review, translation/RTL checks, and approved visual regression baselines.

See [materials](SURFACES_ENVIRONMENT.md), [motion](MOTION_INPUT.md), [platform layout](LAYOUT_PLATFORMS.md) and [licensed external assets](THIRD_PARTY_ASSETS.md).

## Native preview follow-up
Two scoped host proofs now exist in [Android](../native/android) and [Electron desktop](../native/desktop). Both use the small allowlisted [versioned host client](../src/gc-native-host.mjs) and opt in only from their trusted local application origins. The Studio remains fully operable without a host and displays native capabilities only after the host answers. These are isolated alpha previews, not claims of production platform coverage. See [Native Host Integration](NATIVE_HOSTS.md) for build steps, trust boundaries, verification and outstanding release gates.
