# GC UI — Official Aperture Weave identity and provenance

**Authority:** GoreeCloud/brand-assets/products/gc-ui
**Approved by:** GoreeCloud founder, November 6, 2026, after reviewing the actual rendered app icon, wordmarks, and interface artwork
**Source migration:** Founder-approved identity replaces the former GC letterform. The canonical master update is tracked in the brand-assets review branch and must land before this consumer branch is merged. This record does not certify deployed apps.

GC UI remains its own design language and product identity; it is NOT the GoreeCloud platform emblem, GoreeShield symbol, Wardveil branding, or a renamed third-party artwork. Aperture Weave represents Canvas, Surface, and Lens through three folded planes around an open aperture. The icon and color-appropriate wordmarks are unaltered source-identical copies of the approved original SVGs.

## Canonical to local exact-byte mapping

| Canonical source | Local asset | Purpose | Canonical Git blob SHA-1 |
| --- | --- | --- | --- |
| products/gc-ui/app-icon.svg | assets/gc-mark.svg | App tile, favicon and lab header | f931dada18f8743706981ea6eb1e61f426d96170 |
| products/gc-ui/gc-ui-symbol.svg | assets/gc-symbol.svg | Standalone transparent symbol | a38257a5242cd9741dfd1c5c87285b56cddeb868 |
| products/gc-ui/gc-ui-logo.svg | assets/gc-logo.svg | Light-background wordmark | 6522c7955a227490408e453fd23845af2bbeffc1 |
| products/gc-ui/gc-ui-logo-dark.svg | assets/gc-logo-dark.svg | Dark-background wordmark | 46ce79ed0d6200dd6a49f1f2f02c2fa57c8adb89 |

The five immutable design source SVGs, including decorative interface artwork, are also retained with SHA-256 pins in assets/candidates and the canonical brand-assets candidates folder. No icon source is loaded from GitHub at runtime. The historical October 29 original GC letterform Git blob IDs remain in central brand-assets documentation and Git history for recovery.

## Usage and boundaries

1. Use the canonical source-matched app icon for GC UI favicons, reference headers, and app identity. Preserve its aspect ratio and colors. Do not theme-recolor it, place text over it, or substitute the generic GC monogram.
2. Use the color-specific wordmark SVG on light or dark surfaces; the wordmark uses only the approved system-ui font fallback stack (no remote font assets). Glyph rendering may vary slightly by host font, so cross-platform visual acceptance is still important.
3. Adjacent visible GC UI product labels make small nav icon images decorative (empty alt); meaningful standalone artwork and wordmarks get descriptive alternative text.
4. Platform raster derivatives originate only from brand-assets approved app-icon.svg. Do not independently redraw or recalculate a consumer icon. Verified 16–512px PNG and ICO assets live in the central source library; native installers/app bundles must independently incorporate and validate them.
5. Approval of the **identity direction** does not establish human screen-reader/visual acceptance of every screen, a complete native release, all consumer migrations, production deployment, or the Stable status of the broader experimental workspace.

## Testing and source authority

The brand-assets identity/Raster CI verifies source Git objects, metadata and hash manifests. GC UI tests/branding.test.mjs guards the canonical four SVG SHA-1 object IDs; tests/premium-identity-preview.test.mjs guards the original design SHA-256 pins, lab adoption and founder approval labels. Real Chromium/Firefox browser test matrices check light/dark, phone/tablet/desktop, reduced motion and forced colors.

Historical records previously referred to inaccessible GoreeCloud/branding-assets commits 29ea759c and dd13aad. They remain historical claims, not independently reverified provenance. The verified current authority is GoreeCloud/brand-assets.

## Optional Electron desktop-preview icon (source-only development)

The optional Electron host uses the **exact published, founder-approved
Aperture Weave 512px PNG** checked into
native/desktop/resources/aperture-weave-512.png, with the window icon
property referencing that file relative to the source module. This keeps the
developer preview's window/task-switcher identity locally available without
runtime requests to GitHub, third-party image services, or the network.

Canonical source: GoreeCloud/brand-assets/products/gc-ui/raster/icon-512.png.
Expected SHA-256:
12f77149579508284e85c56033d6fe9a93b664db18887dccbf4f3f3f99081880
(75,236 bytes; 512 × 512). The source manifest binds that PNG to the approved
products/gc-ui/app-icon.svg Git blob. The regression in
tests/native-desktop-icon.test.mjs verifies the checked-in bytes, dimensions,
source reference and preservation of Electron sandbox settings.

This is a **source-level optional desktop-preview adoption**, not a signed or
installed Linux/Windows/macOS app icon or a new native package release.
macOS application bundle icons, Windows packaging, Linux launcher metadata,
taskbar/dock acceptance and physical platform testing are still separately gated.
Android adaptive launcher treatment also remains a separate design/packaging
acceptance task; do not use the legacy tile raster as an unreviewed adaptive
foreground.
