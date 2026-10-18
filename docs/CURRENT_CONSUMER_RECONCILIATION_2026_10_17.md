# GC UI — Current consumer source reconciliation

**Read-only verification date:** October 17, 2026.
**Source-of-truth distinction:** The [GoreeCloud GitHub Repository Index](https://docs.google.com/spreadsheets/d/1DXaEn3BDL18F1UrQpHUdkmGhLyAdiY0a/edit) was last verified on October 12. **Live GitHub repository metadata, immutable repository ID, source tree and branch commit govern the October 17 findings.**

The [machine-readable exact-head reconciliation](../registry/consumer-migration-reconciliation.v1.json) covers all **18** entries in the [historical Glaze consumer inventory](CONSUMER_MIGRATION_INVENTORY_2026_10_17.md). The old registry comes from `GoreeCloud/glaze` at `08ad5a45865338011019fb56e07625f011c159bf` (audited October 7). Its consumer statuses describe *that legacy baseline*, **not** current GC UI adoption, current deployment or production eligibility.

## Resolved identity and implementation maturity

| Historical consumer | Live GitHub source | Finding |
|---|---|---|
| GoreeCloud Launcher | [GoreeCloud/launcher](https://github.com/GoreeCloud/launcher) | Standalone repo replaces historical `android-app-defaults/apps/launcher`; **README-only main**, no migrated running UI claimed |
| GoreeCloud Keyboard | [GoreeCloud/keyboard](https://github.com/GoreeCloud/keyboard) | Standalone repo, planning and docs; former monorepo location invalid |
| GoreeCloud Gallery | [GoreeCloud/gallery](https://github.com/GoreeCloud/gallery) | Standalone repo, docs only; former monorepo location invalid |
| GoreeCloud Since | [GoreeCloud/since](https://github.com/GoreeCloud/since) — `app/` | Existing Android Gradle source tree; old monorepo location invalid |
| GoreeCloud Tasks | [GoreeCloud/tasks](https://github.com/GoreeCloud/tasks) | Standalone repo README only; old `goreecloud-tasks` name stale |
| GoreeCloud Reader | [GoreeCloud/reader](https://github.com/GoreeCloud/reader) — `apps/android`, `apps/web` | Source subtrees directly verified |
| GoreeCloud Website | [GoreeCloud/static-websites](https://github.com/GoreeCloud/static-websites) — `sites/main` | Source subtree for the main site directly verified |
| GoreeCloud Memos | [GoreeCloud/memos](https://github.com/GoreeCloud/memos) — `web/` | Substantive web source exists; actual legacy and new design imports **not yet audited** |
| GoreeCloud Browser | [GoreeCloud/browser](https://github.com/GoreeCloud/browser) | Live GitHub repository ID is **1417956029**, different from October 12 index ID; do not reuse obsolete identity |
| GoreeCloud Manager | [GoreeCloud/manager](https://github.com/GoreeCloud/manager) | Live project identity verified; no UI migration claims |
| GoreeCloud Monitor | [GoreeCloud/monitor](https://github.com/GoreeCloud/monitor) | Live repository verified; UI source and adoption not yet audited |
| GoreeCloud Notify | [GoreeCloud/notify](https://github.com/GoreeCloud/notify) | Live service verified; product-specific UI not assumed |
| GoreeCloud News & Weather | [GoreeCloud/news-weather](https://github.com/GoreeCloud/news-weather) | Live repository verified; UI source not yet audited |
| GoreeCloud Security Center | [GoreeCloud/security-center](https://github.com/GoreeCloud/security-center) | Distinct **README-only scaffold**; do not confuse with Wardveil service |
| GoreeCloud Care | [GoreeCloud/zorin-os](https://github.com/GoreeCloud/zorin-os) is **only a candidate** | Zorin OS customization project is not verified as the Care consumer |
| GoreeCloud Advanced Tab Manager | [GoreeCloud/firefox-addons](https://github.com/GoreeCloud/firefox-addons) is **a likely container** | Specific add-on/source subtree not verified |
| GoreeCloud Privacy Center | [GoreeCloud/privacy-shield](https://github.com/GoreeCloud/privacy-shield) is **a possible backend** | Browser privacy subsystem is not proven to be the Privacy Center UI |
| GoreeCloud Notes | **Unresolved** | Both `GoreeCloud/notes` and `GoreeCloud/goreecloud-notes` were not found; do not invent a replacement |

**Separate direct source-tree check:** [`GoreeCloud/android-app-defaults`](https://github.com/GoreeCloud/android-app-defaults) currently has `apps/camera` and `apps/clock` only. It is not the active Launcher, Keyboard, Gallery or Since source. Exact repository `main` SHA and ID for every verified candidate are stored in the JSON ledger.

### Bounded Website source probe (separate feature revision)

A [read-only preliminary Website audit](QA_WEBSITE_LEGACY_PROBE_2026_10_17.md) identified old CSS, HTML and validation references in a **feature checkout** at \`ba4a8a8\`. Its head is **not** the verified Website main revision \`4746af2\`; therefore the exact-main ledger correctly remains \`staticSourceAudit:not-run\`. No production or GC UI migration acceptance is inferred.

## Acceptance interpretation

**Verified repository** ≠ **working source** ≠ **legacy dependency detected** ≠ **GC UI migrated** ≠ **production accepted**.

The ledger has **14 verified product repository identities**, of which **four** have separately verified non-root application source paths; **three** entries require product-owner mapping confirmation, and **one** is unresolved. All 18 explicitly remain `staticSourceAudit:not-run`, `actualGcUiAcceptance:not-evaluated` and `migrationComplete:false`.

Use `npm run migration:reconcile:check` to enforce these integrity distinctions. Use the existing [read-only legacy source auditor](CONSUMER_MIGRATION_AUDIT.md) on the **verified, authorized** source checkout only. A checkout may be clean of explicit legacy names yet still fail GC UI user-experience, keyboard, contrast, privacy, native-platform or package acceptance.

## Bounded source spot checks — October 17, 2026

These findings supplement the 18-consumer identity ledger with **individual source-file observations**. They are not complete static audit runs, build verification, live dependency tests or accepted GC UI migrations. The ledger's `staticSourceAudit:not-run`, `actualGcUiAcceptance:not-evaluated` and `migrationComplete:false` remain unchanged.

- **Memos:** current source tree `538ef410ba8248ae83eb69dae9fba0ae0ed09cb3` contains `web/public/goreecloud/glaze/css/glaze-v1.4.1.css` and `web/public/goreecloud/glaze/js/glaze-v1.7.0.mjs`. Its `docs/GLAZE-ADOPTION.md` describes a pinned HTML stylesheet and unaccepted consumer conformance. Read real `web/` entrypoints before a controlled replacement.
- **Main website:** tree `4746af244b8e59f4939fb327f923e3bbfff5e335` contains legacy CSS under `sites/design/css`; the read-back `sites/main/glaze.lock.json` records version `1.7.0` and `source-adopted-unaccepted`. Inspect actual per-site imports and acceptance independently.
- **Monitor:** tree `46897de12f514a43da3a668e3e9c952e63e9dea6` contains `static/monitoring/css/glaze.1.6.0.css`. That file was read and defines legacy Glaze custom properties and classes; deployed use is unverified.
- **Notify:** tree `1e713ceee14fb2549f03fd6ee62dbe38a64a8de22` includes `client/lib/glaze_theme.dart`, read back with a Flutter `GlazeTokens` and material vocabulary. Native mapping requires a separately qualified GC UI implementation.
- **Firefox add-ons:** tree `cf4aef5bb5f1108f5964b39f57ba768ea3733236` contains Glaze CSS paths for Advanced Tab Manager and Webspaces. Product-specific runtime imports remain unverified.
- **Wardveil / Privacy Shield:** source-tree Glaze stylesheet names exist under their websites. Neither subsystem's old website proves current standalone Security Center or Privacy Center UI ownership.

These are **source-migration leads** only. Never remove source or claim migration from filenames alone. Run the existing bounded, strict read-only consumer auditor at a verified current checkout; preserve incomplete findings, UI/accessibility acceptance and rollback evidence before changes. No consumer source was modified during these checks.

## Implementation sequence, without new speculative gates

Prioritize **Memos** (`web`), **Website** (`sites/main`), **Reader** (`apps`), and **Since** (`app`) for an initial *read-only source/dependency discovery* when their latest revision can be inspected. They have verified source locations and can yield actionable semantic mappings. This sequence is a practical suggestion, not an assertion of active Glaze use. Do **not** migrate or rewrite other repositories under this GC UI-only authorization.

Docs-only/scaffold consumers should first establish what UI is actually being built, rather than invent a "migration" for an absent runtime. Unknown Notes/Care/Privacy Center/Advanced Tab Manager mappings stay open until canonical product ownership is verified.

## Remaining governance boundary

The owner's **permanent GC UI successor decision** is implemented in this repository, but read-only Google Drive `GoreeCloud/Standards` and `GoreeCloud/Policies` currently retain Glaze authority language. Updating those documents requires a **separate, controlled mutation** to the correct records; this GC UI-ledger update does not silently supersede them. The Foundations package remains a private `1.0.0-rc.1` candidate, not the published Anchor release.

No other GitHub repository or Drive file was modified during this verification. Historical governance and third-party attribution are preserved.
