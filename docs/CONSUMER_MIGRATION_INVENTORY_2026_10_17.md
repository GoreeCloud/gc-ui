# GoreeCloud UI — Read-only predecessor consumer snapshot

**Recorded:** 2026-10-17. **Source:** [GoreeCloud/glaze consumer registry at 08ad5a4](https://github.com/GoreeCloud/glaze/blob/08ad5a45865338011019fb56e07625f011c159bf/consumers/registry.json). **Registry's own audit date:** 2026-10-07. **Scope:** discovery evidence only.

This is the owner-authorized **permanent succession** from the prior design language to GC UI, **not** a claim that any of these repositories is currently deployed, currently uses the legacy UI, or has already adopted GC UI. The snapshot's status describes **the previous design-system registry's own baseline** (`1.7.0`), not GC UI acceptance. The list may be incomplete, stale or use historical repository paths, especially for products whose development has moved since October 7.

## Source counts

- **18** product records, **15** distinct repository names in the dated Glaze registry.
- **17** previously classified `adoption-required` against the historical shared baseline; **one** `unverified`.
- **Zero** had a `accepted-v1` status against that Glaze registry at its audit date. This is **not** evidence of a GC UI failure or of current runtime use.
- `productionEligible:false` in the old design registry applies to its own conformance scope; do not conflate it with deployment status in another product's authoritative lifecycle system.

## Historical candidate list for fresh discovery

| Former registry product | Former registered repository / source path | Former registry state |
|---|---|---|
| GoreeCloud Care | `GoreeCloud/goreecloud-zorin-os` / root | adoption-required |
| GoreeCloud Manager | `GoreeCloud/goreecloud-manager` / root | adoption-required |
| GoreeCloud Website | `GoreeCloud/static-websites` / root | adoption-required |
| GoreeCloud Tasks | `GoreeCloud/goreecloud-tasks` / root | adoption-required |
| GoreeCloud Launcher | `GoreeCloud/android-app-defaults` / `apps/launcher` | adoption-required |
| GoreeCloud Keyboard | `GoreeCloud/android-app-defaults` / `apps/keyboard` | adoption-required |
| GoreeCloud Notes | `GoreeCloud/goreecloud-notes` / root | unverified |
| GoreeCloud Monitor | `GoreeCloud/monitor` / root | adoption-required |
| GoreeCloud Browser | `GoreeCloud/browser` / root | adoption-required |
| GoreeCloud Advanced Tab Manager | `GoreeCloud/firefox-addons` / root | adoption-required |
| GoreeCloud Security Center | `GoreeCloud/wardveil` / root | adoption-required |
| GoreeCloud Privacy Center | `GoreeCloud/privacy-shield` / root | adoption-required |
| GoreeCloud Reader | `GoreeCloud/goreecloud-reader` / root | adoption-required |
| GoreeCloud Gallery | `GoreeCloud/android-app-defaults` / `apps/gallery` | adoption-required |
| GoreeCloud Notify | `GoreeCloud/notify` / root | adoption-required |
| GoreeCloud Since | `GoreeCloud/android-app-defaults` / `apps/since` | adoption-required |
| GoreeCloud News & Weather | `GoreeCloud/news-weather` / root | adoption-required |
| GoreeCloud Memos | `GoreeCloud/memos` / root | adoption-required |

**Caution:** The current GoreeCloud development projects may have **different canonical GitHub repositories** from this Glaze-owned historical list. Do not apply a migration script, open an implementation PR or grant current repository authority based only on the historical names in this table.

## Next verified steps per consumer

1. Resolve each product to its **currently authorized** repository and active source root using the current GoreeCloud repository/source index and exact GitHub revision, not merely this outdated registry.
2. Run the [read-only consumer auditor](CONSUMER_MIGRATION_AUDIT.md) only against that explicitly approved current checkout. Record the exact source SHA, limited static report, active source findings and skipped/inconclusive evidence.
3. Define intended GC UI package/API maturity for that product. Only the currently scoped private Foundations release candidate has been independently packaged. A component documented as `specified` or `experimental` must not be presented as a supported stable component.
4. Carry out implementation in that repository **only when separately authorized**, then verify UI behavior, keyboard/focus, contrast, reduced effects, responsive form factors and security appropriate to the shipped features.
5. Update the **correct current** authoritative migration/consumer register only with exact-version evidence, and retire predecessor sources after the consuming system is safely cut over. Preserve historical compliance provenance and third-party notices.

No consumer repository, Glaze repository, or Google Drive document was modified during this discovery. The only approved mutation scope for this work was `GoreeCloud/gc-ui`.

### Governance gap

The old [Glaze conformance policy](https://drive.google.com/file/d/1N4x94phDAgPKGShzTlE4R0CPCM5a8f9U/view) and [universal design standard](https://drive.google.com/file/d/1dQj4rEwPvyGsmgXZdJvFZUWpO-19_ho6/view) still name the predecessor. Their controlled update in the authoritative Drive directories is a **separate outstanding task**, not something this read-only GitHub discovery can complete.

**Lifecycle note:** GC UI's private Foundations `1.0.0-rc.1` is not a publicly qualified `Anchor` design system, and this historical registry is not a GC UI production consumer acceptance record.

## Follow-up: current repository and source-path verification (2026-10-17)

This addendum supplements the **historical October 7 inventory** above; it does not rewrite its 18 product records or turn an old Glaze conformance registry into a live GC UI acceptance register. The GoreeCloud GitHub identity was used for repository existence checks and read-only source inspection on default branches. File paths are **source evidence**, not proof of deployed dependencies or currently running UI.

### Repository identity reconciliation

Of the historical registry's **15 distinct repository names**, **13 were found** as accessible GoreeCloud GitHub repositories under their recorded names. Two were **not found** at those exact names:

| Former registry identity | 2026-10-17 finding | Required next check |
| --- | --- | --- |
| `GoreeCloud/goreecloud-tasks` | Repository not found at this exact path; [`GoreeCloud/tasks`](https://github.com/GoreeCloud/tasks) exists, with a one-file `README.md` tree when inspected | Confirm product ownership, authoritative source location and identity using the current repository index; do **not** assume this is a rename or migrated app |
| `GoreeCloud/goreecloud-notes` | Repository not found at this exact path; [`GoreeCloud/notebook`](https://github.com/GoreeCloud/notebook) exists with a one-file `README.md` tree when inspected | Determine whether Notes was renamed, replaced, retired or resides elsewhere; do **not** equate Notebook with Notes on name similarity alone |

**Found ≠ audited or adopted.** Existence checks were not sufficient to validate executable source, Glaze usage, GC UI import adoption, deployments, acceptance, or the owner of the actual current app. Avoid redirecting a migration PR to a guessed successor repository.

### Canonical repository ownership correction (do not target historical monorepo paths)

The authoritative [GoreeCloud GitHub Repository Index v1.42](https://drive.google.com/file/d/1DXaEn3BDL18F1UrQpHUdkmGhLyAdiY0a/view), last verified **2026-10-12**, expressly supersedes the old `android-app-defaults/apps/launcher`, `apps/keyboard`, `apps/gallery`, and `apps/since` ownership assertions. The index confirms the former monorepo now retains only Camera and Clock application modules. These independent repositories were also individually verified via the authorized GitHub identity on 2026-10-17:

| Historical Glaze registry product/source | Current source-owning repository verified | Observed default-branch tree | Migration boundary |
| --- | --- | --- | --- |
| Launcher — `android-app-defaults/apps/launcher` | [`GoreeCloud/launcher`](https://github.com/GoreeCloud/launcher) | `23f27b60e2b98aec00fa3e4a0ed17938000c2026` (one tree entry) | Early-stage `main` only; independently verify active Development branch/build before UI edits |
| Keyboard — `android-app-defaults/apps/keyboard` | [`GoreeCloud/keyboard`](https://github.com/GoreeCloud/keyboard) | `264dac81dabfdaf028851cf4dff09912c351f23b` (7 entries; historical `docs/GLAZE-ADOPTION.md`) | Old adoption note is not live runtime or release proof |
| Gallery — `android-app-defaults/apps/gallery` | [`GoreeCloud/gallery`](https://github.com/GoreeCloud/gallery) | `99ba2db393f89c01558e89336140a802e5ef1a10` (4 entries) | New-source development, not inherited monorepo Glaze import proof |
| Since — `android-app-defaults/apps/since` | [`GoreeCloud/since`](https://github.com/GoreeCloud/since) | `8a4a90208e868fae11ab4dc5a3f32f7eb9901f55` (125 entries) | Verify actual active source/API before planning a UI transition |

The same canonical index identifies [`GoreeCloud/tasks`](https://github.com/GoreeCloud/tasks) as an early-stage **Tasks** repository and [`GoreeCloud/notebook`](https://github.com/GoreeCloud/notebook) as an early-stage **Notebook** repository. Their existence and descriptions resolve *current named product candidates*, **not** old-source lineage, transferred data, current deployed apps or automatic identity equivalence with the historical `goreecloud-tasks` / `goreecloud-notes` paths. In particular, do not silently equate **Notebook** with **Notes**. Confirm the owner's current product classification and source-of-truth where this affects any substantive migration.

**Priority:** Do not open new feature or migration PRs for Launcher, Keyboard, Gallery or Since against the historical monorepo directories. Read their independent repository/Development branch state first. No historical Glaze registry `sourcePath` was changed by this report.

### Concrete source evidence for initial migration triage

The following selected paths were read or observed in the current default-branch trees; they are **unmigrated-candidate leads**, not an exhaustive complete-code audit. Git tree SHA values identify the inspected *tree snapshot*, not a production release or a consumer acceptance commit.

| Recorded consumer | Read-only source evidence | Triage |
| --- | --- | --- |
| [GoreeCloud Memos](https://github.com/GoreeCloud/memos) | Tree `538ef410ba8248ae83eb69dae9fba0ae0ed09cb3` includes `web/public/goreecloud/glaze/css/glaze-v1.4.1.css` and `web/public/goreecloud/glaze/js/glaze-v1.7.0.mjs`. [`docs/GLAZE-ADOPTION.md`](https://github.com/GoreeCloud/memos/blob/main/docs/GLAZE-ADOPTION.md) explicitly describes pinned legacy runtime linkage and outstanding local acceptance. | **P1 — explicit old runtime sources.** Resolve current frontend entrypoint, map replacement requirements, validate GC UI package first; no blind import rewrite or production change. |
| [GoreeCloud Website](https://github.com/GoreeCloud/static-websites) | Tree `4746af244b8e59f4939fb327f923e3bbfff5e335` includes `sites/design/css/glaze.css` and related old CSS. [`sites/main/glaze.lock.json`](https://github.com/GoreeCloud/static-websites/blob/main/sites/main/glaze.lock.json) identifies Glaze `1.7.0`, `source-adopted-unaccepted`. | **P1 — explicit former design-system asset and lock.** Inspect each site's distinct source and qualified build before selecting staged consumer migration. |
| [GoreeCloud Monitor](https://github.com/GoreeCloud/monitor) | Tree `46897de12f514a43da3a668e3e9c952e63e9dea6` includes [`static/monitoring/css/glaze.1.6.0.css`](https://github.com/GoreeCloud/monitor/blob/main/static/monitoring/css/glaze.1.6.0.css), whose contents define old semantic variables and classes. | **P2 — concrete CSS contract.** Determine live entrypoint/style usage, preserve admin UX and accessibility and qualify a GC UI semantic mapping. |
| [GoreeCloud Notify](https://github.com/GoreeCloud/notify) | Tree `1e713ceee14fb2549f03fd6ee62dbe38a64a8de22` includes [`client/lib/glaze_theme.dart`](https://github.com/GoreeCloud/notify/blob/main/client/lib/glaze_theme.dart) implementing legacy Flutter material/tokens. | **P2 — native platform contract.** GC UI native adapter maturity and actual Flutter build/interaction evidence required before any migration. |
| [Advanced Tab Manager / Webspaces](https://github.com/GoreeCloud/firefox-addons) | Tree `cf4aef5bb5f1108f5964b39f57ba768ea3733236` contains `extensions/advanced-tab-manager/src/shared/glaze.css` and `extensions/webspaces/ui/glaze-webspaces.css`. | **P2 — source file candidates.** Check both extension entrypoints, CSP, browser-native UX and permission boundaries. |
| [GoreeCloud Security Center](https://github.com/GoreeCloud/wardveil) | Tree `577f40827693a4872040249f03cdb69d1411a61c` contains `website/glaze-ui-1.5.0.css` and versioned adoption records. | **P2 — source file candidates.** Security truth and policy gates must remain entirely provider-owned. |
| [GoreeCloud Privacy Center](https://github.com/GoreeCloud/privacy-shield) | Tree `8be5fee633f1da19b2d195dc6ae235c2f94d16d6` contains `website/glaze-ui-2.1.0.css`. | **P2 — source file candidate.** Consent/permission and provider-truth boundaries are non-negotiable. |
| [GoreeCloud News & Weather](https://github.com/GoreeCloud/news-weather) | Tree `c2aa6df47dae3629e83d9ba3ce9f727cb68fae0a` contains `docs/GLAZE-ADOPTION-1.7.md`, which is historical/adoption documentation evidence only. | **Discovery** — inspect current runtime source before classifying any live Glaze dependency. |

For other accessible historical candidates, no complete source-content audit was performed in this follow-up. **No absence of legacy dependencies is inferred from uninspected repositories or filename-only results.** Tree matching was deliberately bounded and may miss embedded CSS, imports, differently branded tokens, generated code, vendored binaries, symlinks or deployed artifacts.

### Sequencing and explicit completion gate

1. **Identity:** reconcile the two missing historical names using the authoritative GoreeCloud repository index. Resolve current main branch, owner and product-specific source roots for all 18 records; do not overwrite history with guesses.
2. **Read-only source inventory:** on the **verified current checkout** for each consumer, run [the bounded legacy auditor](CONSUMER_MIGRATION_AUDIT.md), review path/line findings, and preserve exact revision plus any `incomplete` flags. A clean scan alone is not acceptance.
3. **First vertical slice:** prioritize Memos and the main website **only after** a supported GC UI package/API and license decision exist; implement original components/tokens, prove browser/accessibility/security behavior, and retain bounded rollback. Existing production-facing Glaze source must not be removed merely because this inventory was updated.
4. **Native and sensitive surfaces:** tackle Notify's Flutter bridge and Wardveil/Privacy Shield after platform-specific contract and provider-boundary verification. Do not require a one-to-one relabeling of historical Glaze internals.
5. **Closure:** reconcile Drive authority in place, qualify each actual consumer, verify no live Glaze imports/dependencies or unresolved required bridges, then perform separately verified retirement. The [GC UI succession registry](../registry/design-authority.v1.json) must keep its completion booleans `false` until real evidence establishes otherwise.

**Scope of this addendum:** repository discovery, evidence preservation and migration ordering only. No consumer application, production service, release metadata, Google Drive record or predecessor lifecycle state was changed by this follow-up.
