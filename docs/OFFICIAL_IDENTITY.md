# Official GoreeCloud UI identity — consumer integration

The approved graphic master library is
[`GoreeCloud/brand-assets`](https://github.com/GoreeCloud/brand-assets)
at merged commit `29be2e70201bd12adfcdcb3c25106abf9408c6d1`.
The approved visual direction is **Aperture Weave**, founder-approved
November 6, 2026. `GoreeCloud/gc-ui` is the user-interface authority; it
consumes images but does not replace the central brand master repository.

## November 15 founder rejection of the Frame Relay experiment

The founder reviewed the rendered **Frame Relay v1** logo/icon/favicon/artwork and stated: **"That looks absolutely terrible."** The entire concept family is **rejected**, not merely awaiting approval. Source files are preserved for history in [the rejected central-brand archive](https://github.com/GoreeCloud/brand-assets/tree/main/products/gc-ui/candidates/frame-relay-v1); its manifest is marked `founder-rejected-archived` and its rollout is blocked. Do not copy, repurpose, promote, tweak colors on, or generate derivatives from this failed concept.

**Current official/consumer identity remains the pinned November 6 Aperture Weave** until a **different** GoreeCloud UI design is developed and explicitly founder-approved. No `assets/identity/` copies, SHA-256 pins, live lab favicon or artwork, build/package exports, production deployment or consumer website was changed in response to the rejected concept. The permanent **GoreeCloud umbrella circular-G** remains independent of GoreeCloud UI's product identity.

The failure exposed a quality/process gap: hash-pinned and safe SVGs did **not** mean a good logo. The mechanically literal nested/open-frame symbol, conventional square tile, standard system-font wordmark and diagram-like artwork did not reach the mandated [Exceptional UI Craftsmanship standard](https://github.com/GoreeCloud/brand-assets/blob/main/products/gc-ui/REPLACEMENT-IDENTITY-DESIGN-BRIEF.md). New design exploration must start with an original visual thesis and actual rendered human review, not automated generation of a six-asset family from a generic motif.

A wholly separate candidate, if later authorized, requires human visual review and an explicit decision **before** promotion, native platform derivatives or consumer migration. Automated tests are supporting evidence only. Track the replacement in [central brand issue #18](https://github.com/GoreeCloud/brand-assets/issues/18) and keep visual acceptance open in [GC UI issue #7](https://github.com/GoreeCloud/gc-ui/issues/7). No images will be generated in this chat per the founder's instruction.

### Fail-closed archive import guard

The UI source tests additionally reject accidental exact-byte imports of the six archived, founder-rejected Frame Relay vectors into current `assets/`, and reject direct references to the rejected archive in `lab/` or `src/`. The expected Git blob fingerprints derive from the canonical `brand-assets` rejected manifest, which remains separately checked by brand CI. This is an **exact-source safety guard only**: it does not detect altered artwork, certify visual originality, or grant approval to any new concept. Both repositories must independently pass their CI before future consumer changes.

### Repainted rejected-symbol guard

The consumer source test now independently checks the three original, immutable Frame Relay SVG path command streams in every current `assets/` SVG. Changes to fills, names, path order or coordinate whitespace do **not** make the rejected silhouette eligible for adoption. An altered silhouette, transformed path or visually similar redraw is **not fully detectable** by this restricted source comparison and still requires human review and the founder's explicit decision. This expands the existing exact-file/direct-link checks without introducing any new artwork or changing the interim active brand identity.

## Consumer copy mapping

| GC UI local asset | Central master | SHA-256 |
| --- | --- | --- |
| `assets/identity/app-icon.svg` | `products/gc-ui/app-icon.svg` | `a1bf6370761f247a56666c0d61ba615dce3e5789c6e7845c630caecf6d9de418` |
| `assets/identity/symbol.svg` | `products/gc-ui/gc-ui-symbol.svg` | `78794bc48907ddd822b42d96cd0be0061bd1b1b4fe168384e5a3818afef50078` |
| `assets/identity/logo-light.svg` | `products/gc-ui/gc-ui-logo.svg` | `4e40c93337c84de16560b26d701a3334d3b448bc7e04a2efe189944eac680682` |
| `assets/identity/logo-dark.svg` | `products/gc-ui/gc-ui-logo-dark.svg` | `dcdd57b18d94673973f1771f91752ece56d93737679b56bed4b8339719d1eb66` |
| `assets/identity/favicon.ico` | `products/gc-ui/raster/favicon.ico` | `874fe939d8ce7a3958d11b7d1655daa22389beeb6a903c87eb17590e57a94313` |
| `assets/identity/interface-constellation.svg` | `products/gc-ui/artwork/interface-constellation.svg` | `50661cf8d84818240ac7ac5e273123e041f9471ef4aa953d2be05019e4aef6aa` |

All six are exactly pinned. No recoloring, re-rendering, external SVG
requests, third-party webfonts or analytics are needed.

## Scope and evidence

The experimental `lab/index.html` now references an SVG favicon and an
ICO fallback, replaces a generic star placeholder in the navigation rail
with the official app icon, presents the light/dark wordmark variants,
and adds an identity section using the conceptual Canvas/Surface/Lens
artwork. The illustration is not a screenshot of deployed functionality.

`tests/official-identity.test.js` checks exact hashes, vector safety,
favicon usage and semantic identity-section references. The full local
Node source check passed 118 tests after generating disposable platform
token outputs. A sampled local Chromium review of the lab passed five
light/dark desktop/mobile viewport checks (320/390/1440px) with loaded
image assets, no overflow, no reported JavaScript or external requests;
this does not prove screen-reader experience, every zoom level, or native
packaging. Lab source remains alpha, not certified Stable.

## Further acceptance

- Verify production web deployment and PWA icon paths if/when the lab
  becomes a hosted consumer; no lab deployment is implied.
- Complete manual high-zoom, forced-colors, light/dark, native app-icon,
  screen-reader and real touch acceptance.
- All official marks remain copyright/provenance-controlled; repository
  open-source licensing does not automatically waive brand/trademark rights.

## Web-foundation package distribution boundary

The separate **public npm design-system library** intentionally packages the generated first-party functional icon registry/sprite but **does not bundle** `assets/identity/` logo, app-icon, favicon or hero-artwork masters. These six official assets remain intact in the public `GoreeCloud/gc-ui` source repository for the reference lab and provenance tests, with authoritative originals in `GoreeCloud/brand-assets`. Consumers needing official branded imagery must follow separately verified product identity/asset-rights instructions; a library's MIT declaration does not grant trademark usage rights by implication. This does not revoke or alter existing repository ownership or set a new asset license.
