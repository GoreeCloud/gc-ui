# GoreeCloud UI Foundations v1.0.0 — Release notes

**Scope:** Stable, Apache-2.0 semantic tokens, color generation and DOM theme controller only. Original code; zero runtime dependencies.

**Public API:** `generateTheme`, `contrastRatio`, `GC_THEME_DEFAULTS`, `normalizeTheme`, `resolveTheme`, `createThemeController`, `GC_UI_VERSION`; `/tokens` JSON and `/css/tokens` CSS. TypeScript declarations included. Node.js 20+ and tested current Chromium/Firefox.

**Verification:** Stage the exact source with `npm run release:foundations:stable:verify`, then compile `npm run release:foundations:types`. The CI stable job installs the archive offline and tests the installed package in both browsers. Source authority, restricted deep imports, SHA-256 installed-file provenance and archive checksums are verified.

**Delivery:** The supported GitHub release archive `goreecloud-gc-ui-1.0.0.tgz` is accompanied by `SHA256SUMS`. Install the verified archive with `npm install ./goreecloud-gc-ui-1.0.0.tgz`. Registry distribution is a separate channel that must be verified before claiming availability.

**Compatibility:** SemVer applies to this narrow public package surface only. Existing projects should pin the exact version and validate upgrades.

**Exclusions:** Experimental patterns, native Android/Electron hosts, signed installers, motion/depth utilities, third-party icons, and ecosystem-wide legacy migration are not part of this Foundations release.

**Recovery:** Preserve checksum and artifact, restore a previous verified release version if available, and issue a new tested patch instead of modifying immutable release bytes. Track support and security reports in GoreeCloud/gc-ui issues.

This release does not change the broader development workspace's alpha maturity or claim WCAG/platform-wide accessibility certification.
