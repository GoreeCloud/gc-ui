# GC UI — Contextual Surface & Environmental Light System

**Status:** experimental web module / design specification candidate. Not production accessibility certification.

## Purpose and principles

GC UI materials are relationships between Canvas (ambient scene), Surface (readable information), and Lens (bounded floating controls). Balanced Surface Color should not turn into neon lighting, full-page blur, animated gradients, or decorative overload.

The [Material Environment Lab](../lab/environment.html) is the interactive reference, and the [Adaptive Shell](../lab/adaptive.html) uses real route-based workspace/analysis/reading contexts. The reusable implementation is [surface runtime](../src/gc-surface-runtime.mjs), [material CSS](../styles/gc.v1.materials.css), and [native motion presets](../src/gc-motion-presets.mjs). The shared token roles remain authoritative.

**Illumination:** only two static diffuse radial washes, sourced from the already validated primary and tertiary *container* roles. The Canvas always has an opaque fallback. No pointer-following spotlights, moving backgrounds, parallax, looping bounces, or gradients behind unsupported text contrast. Illumination OFF removes the washes. Forced colors and high contrast override decoration.

## Treatments

| Treatment | Purpose | Constraints |
|---|---|---|
| default Surface | Default content | Opaque, legible |
| tonal | Grouping/sidebar content | Semantic role, not color-only state |
| inset | Nested information | Adjacent planes remain distinguishable |
| raised | Focused elevated panel | One grounded shadow, not endless nested cards |
| ambient | Contextual emphasis | Controlled primary container mix |
| focus | Active content workspace | Stronger outline and readable Surface |
| lens | Short-lived floating controls | No long text, no nested Lens; solid fallback |

Use the data-gc-treatment attribute on a gc-material-surface element. The existing **Lens budget** remains one dominant region and up to two auxiliary regions per viewport, with reviews for exceptions.

## Content-adaptive contexts

| Context | Auto intensity | Visual behavior |
|---|---|---|
| workspace | balanced | Gentle environmental wash and layered work areas |
| reading | quiet | Minimal wash; solid reading surfaces |
| analysis | quiet | Crisp outlines and shadow restraint |
| media | balanced | Contextual ambience only; content stays grounded |

Explicit user intensity choices can be quiet, balanced or expressive, but reading/analysis cap the environmental washes. Application code selects the context based on the *current activity*, not assumed accessibility needs. The runtime exposes effective values through root data attributes for context, intensity, illumination and Lens fallback.

The controller persists supported settings locally, follows forced-colors/reduced-transparency/reduced-motion media queries, and has a destroy lifecycle. It does not read wallpaper, cameras, sensors, or environmental light. Render-time CSS composition may differ by browser; test real screenshots and contrast.

## Motion

Native Web Animations presets include reveal, soften, settle, slideInline and dismiss. All are optional. Reduced motion, high contrast and forced colors suppress motion. Direction-sensitive slideInline supports RTL. Native interaction state and focus always remain valid without animation. Optional third-party engines are documented in [Third-Party Assets](THIRD_PARTY_ASSETS.md).

## Quality and release gates

Check composited 4.5:1 body text contrast, 3:1 UI indicators, real focus rings, dark/light/high-contrast themes, forced colors, reduced transparency and reduced motion. Verify 320px, 200/400% browser zoom, localization, RTL, touch and keyboard, and profile frame/GPU cost on representative devices.

Automated source and browser tests are evidence, not certification. Actual screen-reader signoff, cross-browser visual comparison, native platform integration, low-end hardware power tests and full media background contrast analysis remain open before any stable release.

## Lighting direction and resource restraint
A stable semantic direction (overhead, leading, or trailing) positions the same two low-intensity ambient washes without changing textual contrast. The leading/trailing choices mirror under RTL; no light animation runs while switching directions. CSS prefers-reduced-data disables the washes and expensive Lens blur when browsers support it. Direction changes are user/application settings, not access to camera or physical lighting sensors.

The [Licensed Icon Atlas](../lab/icon-atlas.html) and [Motion Gallery](../lab/motion-gallery.html) are separate opt-in inspection labs, keeping the material reference focused on Canvas / Surface / Lens semantics.
