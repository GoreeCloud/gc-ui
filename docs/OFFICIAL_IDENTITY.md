# Official GoreeCloud UI identity — consumer integration

The approved graphic master library is
[`GoreeCloud/brand-assets`](https://github.com/GoreeCloud/brand-assets)
at merged commit `29be2e70201bd12adfcdcb3c25106abf9408c6d1`.
The approved visual direction is **Aperture Weave**, founder-approved
November 6, 2026. `GoreeCloud/gc-ui` is the user-interface authority; it
consumes images but does not replace the central brand master repository.

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
