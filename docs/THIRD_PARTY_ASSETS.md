# GC UI — Licensed Third-Party Assets & Motion Integration

**Status:** experimental, opt-in library. The twelve original GC UI symbols remain the default identity. External artwork must never be labeled as original GoreeCloud artwork.

## Bundled assets

The [machine-readable asset manifest](../registry/third-party-assets.v1.json) tracks **21 locally copied source SVG files** from **seven free icon libraries**, their upstream source paths and commit revisions, plus a derived namespaced sprite. Every upstream library's license text is kept beside its source SVGs under assets/third-party. No external CDN is required to display these icons.

| Library | Governing license | Included icons | Notes |
|---|---|---:|---|
| [Lucide](https://github.com/lucide-icons/lucide) | ISC; MIT for Feather derivatives | 3 | rounded outline |
| [Tabler Icons](https://github.com/tabler/tabler-icons) | MIT | 3 | utility outlines |
| [Heroicons](https://github.com/tailwindlabs/heroicons) | MIT | 3 | utility outlines |
| [Bootstrap Icons](https://github.com/twbs/icons) | MIT | 3 | compact filled shapes |
| [Feather](https://github.com/feathericons/feather) | MIT | 3 | minimal outlines |
| [Iconoir](https://github.com/iconoir-icons/iconoir) | MIT | 3 | geometric outlines |
| [Phosphor Icons](https://github.com/phosphor-icons/core) | MIT | 3 | filled regular shapes |

**Free does not imply public domain.** Preserve the copyright/license notices. Source SVG geometries are retained; the separate convenience sprite composes them under gc-ext-provider-name identifiers, with currentColor where applicable. Use one consistent family per bounded component group, and review imported visual weight, contrast and RTL metaphors before use.

Example HTML (replace the icon ID with one from the registry):

    <svg aria-hidden="true" width="24" height="24">
      <use href="/assets/third-party/gc-third-party-glyphs.svg#gc-ext-lucide-sparkles"></use>
    </svg>

Icon-only controls need an accessible name on the control, not just the SVG. Do not ship all full-size icon fonts automatically. The sprite is optional and does not replace the original SVG symbol library.

## Optional external motion engines

The [adapter module](../integrations/optional-motion.mjs) supports three independently installed MIT-licensed runtimes:

| Engine | License | API adapter | When useful |
|---|---|---|---|
| [Motion](https://github.com/motiondivision/motion) | MIT | playWithMotion | short spatial transitions |
| [FormKit AutoAnimate](https://github.com/formkit/auto-animate) | MIT | enableAutoAnimate | list insertions and removals |
| [Airbnb Lottie Web](https://github.com/airbnb/lottie-web) | MIT | mountLottie | playback of separately licensed animation data |

The base GC UI package has **no dependency on these runtime libraries**: application developers install them independently and pass their functions/objects into adapters. Native Web Animations remains the default. Motion is disabled where OS accessibility or user high-contrast requires it. Animation JSON/files from marketplaces or galleries **do not inherit** the Lottie playback engine's MIT license; license each data file separately.

### App-level usage pattern

Choose only the engine a product needs; install it in that product, not globally in GC UI.

```js
// After the application installs motion independently:
import {animate} from 'motion';
import {playWithMotion} from '@goreecloud/gc-ui/integrations/motion';
playWithMotion(animate, panelElement, 'reveal');

// For list insertion in an app that installed @formkit/auto-animate:
import autoAnimate from '@formkit/auto-animate';
import {enableAutoAnimate} from '@goreecloud/gc-ui/integrations/motion';
enableAutoAnimate(autoAnimate, listElement);

// Lottie JSON data needs its own verified license, independently of lottie-web.
```

## Intake and update policy

Before merging a new third-party icon, image, animation, sound, transition or typeface, record its official repo, exact commit/tag, original file path, complete license notice, author copyright attribution, redistribution/editing rights, and application use case. Verify SVGs contain no scripts, remote images, foreignObject, or external references. Review weight and consistency before use, keep originals next to derivatives, and validate that package exports include license files.

Do not assume assets offered for free online permit redistribution. License terms can change between versions, including libraries that used to have permissive licenses; pin and review before upgrading. Respect trademarks and exclude proprietary OS assets. Prefer pinned, local, auditable resources to unversioned remote CDNs.

## QA

Test contrast and accessible names for each essential glyph; test screen-reader, keyboard, RTL and high zoom. Check autoplay, pausing, reduced motion, flashes, loading states, CPU/GPU usage, network policy and resource byte budgets for any motion/media integration. Licensing, performance and accessibility are separate release gates.

See [GC original glyph library](ICONS_LIBRARY.md), [motion](MOTION_INPUT.md) and [contextual materials](SURFACES_ENVIRONMENT.md).
