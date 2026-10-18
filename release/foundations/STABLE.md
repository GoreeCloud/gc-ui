# GoreeCloud UI Foundations 1.0.1

License: Apache-2.0 (see LICENSE).

Install the versioned package archive from the foundations-v1.0.1 GitHub release. Verify SHA256SUMS, then run npm install ./goreecloud-gc-ui-1.0.1.tgz. Registry installation requires confirmed registry publication.

Supported exports: generateTheme, contrastRatio, GC_THEME_DEFAULTS, normalizeTheme, resolveTheme, createThemeController, GC_UI_VERSION. Supported JSON and CSS subpaths: @goreecloud/gc-ui/tokens and @goreecloud/gc-ui/css/tokens. Types included. No runtime dependencies.

Use Node.js 20+ for pure ESM utilities and supported current Chromium/Firefox for browser DOM theme controllers. Stylesheets must be loaded explicitly by browser bundles.

SemVer compatibility: patch versions fix compatible defects; minor versions add compatible capability; incompatible public contract changes require major versions. Pin exact versions and keep verified archives for rollback.

Excluded: experimental component catalog, platform/native preview packages, motion/depth utilities, third-party icons, and legacy app migration. No third-party icon pack is included in this package. Foundations stable does not certify the wider alpha repository.

Issue tracker: https://github.com/GoreeCloud/gc-ui/issues .
