# GoreeCloud UI Foundations — 1.0.0-rc.1

**Release candidate, not approved stable 1.0.0.** This dependency-free
foundations package is intentionally narrower than the GC UI design language.

## Supported candidate surface

Exports from `@goreecloud/gc-ui`: `generateTheme`, `contrastRatio`,
`GC_THEME_DEFAULTS`, `normalizeTheme`, `resolveTheme`,
`createThemeController`, and `GC_UI_VERSION`.

Resource subpaths: `@goreecloud/gc-ui/tokens` (DTCG-style JSON)
and `@goreecloud/gc-ui/css/tokens` (generated semantic stylesheet).
TypeScript declarations cover the supported entrypoint.

Light/dark, curated/custom color accents, forced-color/high-contrast and
reduced-transparency fallbacks are within the scope. The browser theme
controller handles cleanup, media-query changes and storage restrictions.

**Not included:** experimental 63-pattern catalog components, labs,
native Android/Electron hosts, depth/motion libraries, third-party
illustrations or unshipped native SDK adapters.

## Local install — no npm publishing

Run `npm run release:foundations:verify` in the source repository to
build, pack and smoke-install an actual local tarball under
`dist/foundations-verify/`. Install the resulting tarball in your project.

```js
import {generateTheme,createThemeController} from '@goreecloud/gc-ui';

const light=generateTheme('#3978D3','light');
console.log(light.roles.primary);
const controller=createThemeController(); // browser DOM only
controller.set({accent:'custom',seed:'#3978D3'});
controller.destroy();
```

In a browser bundle load the exported token stylesheet; bundlers must
handle CSS imports separately from Node's ESM loader.

## Release boundaries

- The staged candidate is `private:true` and `1.0.0-rc.1`.
  Packaging verification does not publish to npm or tag Git.
- The original GC UI repository currently declares `UNLICENSED`. This
  script grants no new redistribution license. Owner licensing and
  publishing decisions remain open before external distribution.
- SemVer and compatibility for the **candidate subset** are proposed;
  experimental root exports remain unsupported.
- No global WCAG certification, native installer, VoiceOver/NVDA
  certification or energy-savings promise is made.

The source repository's `docs/STABLE_RELEASE_SCOPE.md` contains the
owner-approved acceptance policy. Optional hardware investigations are
not stable foundations release blockers.
