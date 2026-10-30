# GoreeCloud UI — Web Controls Seal Qualification Candidate

**Artifact:** `@goreecloud/gc-ui@0.2.0-seal.0` (local QA tarball only)  
**Classification:** experimental, unpublished, unapproved candidate; **not Seal or Anchor**  
**Source:** `GoreeCloud/gc-ui`, current root development workspace (`0.2.0-alpha.1`)  
**License:** Apache-2.0, with the repository's actual LICENSE file included.

This intentionally narrow candidate lets the solo maintainer evaluate a real,
installable browser-component distribution without stabilizing the 63-pattern
catalog, changing the independent public **Foundations 1.0.1** release, or
claiming that the entire GC UI workspace has reached the release lifecycle
candidate stage. It has no external runtime dependencies.

## Declared candidate API

The sole JavaScript entrypoint exposes 16 exact exports:

- Existing Foundation utilities: `generateTheme`, `contrastRatio`,
  `GC_THEME_DEFAULTS`, `normalizeTheme`, `resolveTheme`,
  `createThemeController`, `GC_UI_VERSION`.
- Browser progressive enhancement: `nextTabIndex`, `initTabs`,
  `initDialog`, `createToast`, `runAsyncAction`,
  `nextMenuIndex`, `initMenu`, `initChoiceChips`,
  `initDisclosureGroup`.

Five package export paths are allowed: the root module, `/tokens`,
`/css/tokens`, `/css/components` and `/css/palettes`.
The last three CSS resources require explicit opt-in by consuming applications.
The script stages only the original GC UI runtime sources, versioned semantic
tokens, component/palette CSS, narrowed TypeScript declarations, an exact-file
SHA-256 provenance record and this document. It does **not** ship labs, test
fixtures, icons from third parties, platform hosts, native installers, or
network backends.

The original controls retain native HTML semantics and support incremental
enhancement. An integrating application must supply suitable accessible
markup, content, focus management, keyboard navigation and complete state
handling for its own supported UX. Native platform implementations are not
conferred merely by importing these web modules.

## Reproducible local qualification

From the repository root:

```sh
npm run release:seal:web:verify
npm run release:seal:web:types
```

The first command stages an exact-file archive in `dist/seal-web-verify/`,
checks every archive file against its allowlist, writes `SHA256SUMS`,
verifies the staged file digests, performs a clean **offline installation**,
checks the installed bytes, exercises real imports, and rejects unavailable
native-host imports. The second command compiles the **installed candidate
consumer** against pinned TypeScript 5.9.3. Neither command tags a release,
publishes to npm or changes the root workspace version.

Example usage (only inside an explicitly labeled preview consumer):

```js
import {createToast,initTabs} from '@goreecloud/gc-ui';
// Separately load GC UI /css/tokens, /css/components and /css/palettes
// in a browser bundler or static stylesheet pipeline.

const toast=createToast(document.querySelector('#notifications'));
const tabs=initTabs(document.querySelector('[role="tablist"]'));
toast.show('Saved locally.',{duration:6000});
// On view teardown:
tabs.destroy();
toast.destroy();
```

## Acceptance boundaries

The **Seal candidate** classification itself remains pending until a
source-pinned, reviewed candidate and its applicable release evidence
are accepted. Candidate prerequisites include:

1. Verified exact-head core, browser and native CI for the source revision
   used to build the archive.
2. Reproducible tarball bytes/provenance, offline consumer import/type checks,
   correct third-party/license notices and a documented supported API.
3. Source-level and real rendered UI accessibility, 320px/reflow, theme,
   keyboard/ARIA, focus/teardown, forced-colors, RTL and reduced-motion evidence
   appropriate for the **declared web-only component subset**.
4. Recorded review of inconclusive axe scans and relevant visual evidence,
   limitations and actual supported browser/platform coverage.
5. An explicit versioned release candidate decision under the applicable
   GoreeCloud release lifecycle. An automated green badge alone is insufficient.

**Not implied:** stable components, WCAG certification, independent human or
platform screen-reader certification, accepted native Android/iOS/macOS/
Windows/Linux applications, npm availability, ecosystem consumer migration,
full prior design-system retirement, or Anchor production qualification.

The root experimental package stays private. Downstream consumer validation
and the independent Foundations version remain separately governed by
`docs/STABLE_RELEASE_SCOPE.md`, `docs/RELEASE_PLAN_V1.md`, and
`docs/DESIGN_SYSTEM_SUCCESSION.md`.
