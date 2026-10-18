# GC UI Foundations — 1.0.0 Release Candidate 1

**Checkpoint:** October 17, 2026. **Repository:** GoreeCloud/gc-ui only.
**Artifact:** locally packable and offline-installable `@goreecloud/gc-ui@1.0.0-rc.1` foundations subset.
**Disposition:** Validated **release candidate**, NOT stable 1.0.0 and NOT published to npm.

## Design-system succession status

This candidate belongs to the owner-designated, exclusive future design authority: **GoreeCloud UI**. The [succession plan](DESIGN_SYSTEM_SUCCESSION.md) does not convert an unsigned, private release candidate into ecosystem-wide migration acceptance or platform Anchor qualification. The legacy system's independent source is not included.

## Candidate boundaries

This is the first deliberately **scoped** GC UI distribution, defined under the
[owner-approved stable-release policy](STABLE_RELEASE_SCOPE.md).

| Package surface | Included candidate support |
|---|---|
| Root JavaScript ESM | `generateTheme`, `contrastRatio`, `GC_THEME_DEFAULTS`, `normalizeTheme`, `resolveTheme`, `createThemeController`, `GC_UI_VERSION` |
| Theme/font/color basis | Light/dark, curated/custom accents, current OS color/contrast/material preference safeguards; deterministic independent OKLCH engine |
| JSON subpath | `@goreecloud/gc-ui/tokens` — DTCG-style v1 semantic token data |
| CSS subpath | `@goreecloud/gc-ui/css/tokens` — generated semantic CSS, forced-colors and reduced-motion support |
| Types | TypeScript declaration file for the exact root entrypoint |
| Source mapping | Both source modules plus a generated narrow entrypoint; hashed provenance manifest |
| Distribution | 9 allowlisted files, zero runtime dependencies, no dev labs or native hosts |

**Not stabilized:** the 63-component specification/32 experimental web patterns;
tabs/dialogs/toasts/forms; motion and depth helpers; desktop/Android integrations;
native signed apps; wallpaper/sensor engines; third-party asset packs; labs.
Those still exist in the **root alpha source** without being exposed as stable
foundations exports.

## Verification

From the checked-out repository:

```sh
npm run check
npm run release:foundations:build
npm run release:foundations:verify
npm run release:foundations:types
```

`release:foundations:verify` reproducibly rebuilds the candidate, runs
`npm pack` on the staged package, checks the exact nine-file allowlist and
SHA-256 source provenance, then **installs the actual .tgz offline** into
`dist/foundations-verify/consumer/`. It loads the installed ESM module,
token JSON and CSS, checks theme/color contrast and forced-colors behavior,
and ensures unsupported native exports are blocked.

`release:foundations:types` runs pinned TypeScript 5.9.3 over a **consumer
fixture** that imports the actual installed package. It verifies exported
types and uses negative compile assertions on unavailable alpha APIs.
These checks run in GitHub's Node 22 core workflow, which also uploads
the candidate tarball as an **unsigned QA artifact**, not an npm release.

The original full GC UI source/tokens/tests and Chromium/Firefox QA remain
their own independent gates. Existing 12/12 user-reported Android TalkBack
acceptance is preserved. Optional extra physical phones, watt/joule testing
and broader human desktop screen-reader sessions do **not** block a scoped
foundations release.

## Required before stable publication

- **Licensing/redistribution decision:** Root currently declares `UNLICENSED`.
  Do not invent or silently substitute MIT/Apache-2.0. The staged candidate
  stays `private:true`; owner must decide a real supported license and
  distribution terms before making it publicly publishable.
- **Package identity and scope:** Confirm registry access to
  `@goreecloud/gc-ui`, the first stable supported foundations exports and
  support commitments. The wide experimental alpha root remains separate.
- **Final owner approval:** Approve SemVer `1.0.0` tagging, public npm
  publication, final changelog/release notes, and compatibility promise.
- **Post-approval execution:** Rebuild after the approved manifest/license
  updates, rerun tarball/TS/browser/security checks, and publish/tag only
  the reviewed artifact (no automatic publishing in this milestone).

The candidate may be improved without adding new mandatory hardware
conditions. Neither CI success nor `1.0.0-rc.1` means the public v1 package
has been published.
