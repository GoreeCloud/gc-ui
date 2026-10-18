# GoreeCloud UI Foundations v1.0.0 — Release notes

**Publication (2026-10-17 America/Chicago):** [Public GitHub release foundations-v1.0.0](https://github.com/GoreeCloud/gc-ui/releases/tag/foundations-v1.0.0), non-prerelease, Apache-2.0. Exact tagged source: `1d8e25330a49cdab4412c1323e95baafd136b7b2`. SHA-256 of the downloadable `goreecloud-gc-ui-1.0.0.tgz`: `8db29188f90da8936f5452a01b2414ffe8f295092320f1d67221c4a95bc28102`. [Exact-source core and stable package browser CI](https://github.com/GoreeCloud/gc-ui/actions/runs/39098058411) passed; [release archive](https://github.com/GoreeCloud/gc-ui/releases/download/foundations-v1.0.0/goreecloud-gc-ui-1.0.0.tgz) and [SHA256SUMS](https://github.com/GoreeCloud/gc-ui/releases/download/foundations-v1.0.0/SHA256SUMS) were uploaded and independently redownloaded with matching hashes. **npmjs.org registry publication is not claimed**; it needs verified publishing credentials and namespace authority.

**Scope:** Stable, Apache-2.0 semantic tokens, color generation and DOM theme controller only. Original code; zero runtime dependencies.

**Public API:** `generateTheme`, `contrastRatio`, `GC_THEME_DEFAULTS`, `normalizeTheme`, `resolveTheme`, `createThemeController`, `GC_UI_VERSION`; `/tokens` JSON and `/css/tokens` CSS. TypeScript declarations included. Node.js 20+ and tested current Chromium/Firefox.

**Verification:** Stage the exact source with `npm run release:foundations:stable:verify`, then compile `npm run release:foundations:types`. The CI stable job installs the archive offline and tests the installed package in both browsers. Source authority, restricted deep imports, SHA-256 installed-file provenance and archive checksums are verified.

**Delivery:** The supported GitHub release archive `goreecloud-gc-ui-1.0.0.tgz` is accompanied by `SHA256SUMS`. Install the verified archive with `npm install ./goreecloud-gc-ui-1.0.0.tgz`. Registry distribution is a separate channel that must be verified before claiming availability.

**Compatibility:** SemVer applies to this narrow public package surface only. Existing projects should pin the exact version and validate upgrades.

**Exclusions:** Experimental patterns, native Android/Electron hosts, signed installers, motion/depth utilities, third-party icons, and ecosystem-wide legacy migration are not part of this Foundations release.

**Recovery:** Preserve checksum and artifact, restore a previous verified release version if available, and issue a new tested patch instead of modifying immutable release bytes. Track support and security reports in GoreeCloud/gc-ui issues.

This release does not change the broader development workspace's alpha maturity or claim WCAG/platform-wide accessibility certification.
