# GoreeCloud UI — Public API boundary for the proposed Stable 1.0 web foundation

**Status:** source-classified candidate, **not Stable**, not published. Existing package version remains `0.1.0-alpha.0`; the [1.0 release gates](../registry/release-plan.v1.json) remain open.

## Canonical import boundary

- **Candidate Stable 1.0 JavaScript entry:** `@goreecloud/ui/foundation`, exporting exactly the theme utilities, icon utilities and four native-pattern helpers listed in `registry/release-plan.v1.json` under `rootSymbolClassification.candidateStable`. It does not include unqualified preview controllers. This is an initial contract candidate, **not a promise already frozen or released**.
- **Candidate Stable direct paths:** `@goreecloud/ui/theme`, `/patterns`, `/icons`, `/tokens`, `/tokens.css`, `/components.css`, `/glass.css`, `/icon-sprite`, `/icon-registry`. The direct CSS/tokens/icons paths remain separately listed because browser CSS is imported explicitly; `/foundation` is JS/type declarations only. **All are still alpha pending 1.0 acceptance.**
- **Compatibility-only preview (preview-compatibility):** `@goreecloud/ui` (root entry) remains importable for existing alpha users. It intentionally re-exports **both** candidate foundation utilities and advanced preview controllers. Root imports are **not the supported 1.0 frozen API**; consuming apps should migrate foundation-only calls to `/foundation` before 1.0. Never silently break legacy imports or label preview utilities Stable.
- **Advanced preview direct paths:** `/commands`, `/menu`, `/table`, `/tree`, `/combobox`, `/bottom-nav`, `/navigation-rail`, `/signal-board`. Distinct functional quality checks exist, but broad compatibility guarantees and product adoption remain later 1.1+ qualification work. The root's `defineCustomElements`, `initTabs`, `openDialog`, `closeDialog`, `toast`, `bindThemeControls`, `matchesCommand`, `initAvailabilityFeedback`, navigation and signal functions are preview until explicitly qualified.
- All direct names and exported root symbols have an exact machine-readable classification. Automated tests compare that list to the actual package's export map, root JS names, `/foundation` JS names and type re-exports; a new name cannot join the candidate Stable surface silently.

## Compatibility, style and release risk

The version policy is semantic versioning: compatible fixes in `1.0.x`, backward-compatible additive stable improvements in `1.1.0`, `1.2.0`, etc.; incompatible changes to the actual frozen Stable API require `2.0.0` and upgrade notes. Preview APIs may evolve and are explicitly excluded from the 1.0 frozen guarantee; consumers must not infer unsupported runtime/OS compatibility.

No mandatory brand/global hue or appearance exists. Each `.gc-app[data-gc-theme]` can choose its own colors and light/dark preference; themed CSS and frosted Cloud Lens require legible solid/forced-colors fallbacks. This API split neither authenticates users nor implements GoreeShield privacy, Wardveil security, Mesh integrations, or Identity authorization.

**Release gate remains open:** proposed stability does not establish browser engine support, manual full-screen visual signoff, source/license and package provenance, public registry publication, native OS support or consumer migration. Do not promote the version or close the API gate without a final qualified source contract and exact release-candidate evidence.
