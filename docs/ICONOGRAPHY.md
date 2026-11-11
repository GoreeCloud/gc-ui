# GoreeCloud UI — Original glyph and iconography contract

**Status:** Original line icon family, alpha. No vendor assets, proprietary icon fonts or remote icon services.

## Core rules

- Original path shapes in `src/icons.js` are the sole source of truth for this icon family.
- The 24×24 coordinate system, 1.8 stroke width, round caps and round joins are consistent across the catalogue.
- Size tokens: 16, 20, 24, 32 CSS pixels. Increase hit area independently to at least the platform's recommended touch target.
- Purely decorative icons are hidden from assistive technology. Icon-only buttons need an actual accessible name on the **button**, not just their graphic.
- Avoid color alone for meaning. Prefer labeled status or action text where an icon would be ambiguous.

## JavaScript API

Import `ICON_NAMES`, `hasIcon`, `iconSvg` from `@goreecloud/ui/icons` or the primary module. `iconSvg(name, { size: 24, decorative: true })` accepts only predefined glyph names and a bounded size. `gc-icon` is a progressive enhancement provided by `defineCustomElements()`.

## Static symbol sprite

Run `npm run icons:generate` to regenerate `assets/gc-icons.svg` and `assets/gc-icons.json`. The sprite is a resource bundle of `<symbol>` elements, **not a font**.

Example (include the sprite in your own asset pipeline or serve it from your application origin):

    <button type="button" aria-label="Search" class="gc-button gc-button--icon">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <use href="/assets/gc-icons.svg#gc-icon-search"></use>
      </svg>
    </button>

The SVG reference uses a same-origin relative path provided by the integrating application; it is not an external telemetry call. Test browser SVG use support and CSP restrictions where relevant. Native platform asset conversion is **not** shipped here.

## Verification

`npm run icons:check` compares generated glyph assets byte-for-byte with the programmatic source. `tests/icon-assets.test.js` checks symbol count, names, path safety and package exports. This does not establish optical alignment in every display density or real assistive-technology acceptance.
