# GoreeCloud UI — Read-only predecessor consumer snapshot

**Recorded:** 2026-10-17. **Source:** [GoreeCloud/glaze consumer registry at 08ad5a4](https://github.com/GoreeCloud/glaze/blob/08ad5a45865338011019fb56e07625f011c159bf/consumers/registry.json). **Registry's own audit date:** 2026-10-07. **Scope:** discovery evidence only.

This is the owner-authorized **permanent succession** from the prior design language to GC UI, **not** a claim that any of these repositories is currently deployed, currently uses the legacy UI, or has already adopted GC UI. The snapshot's status describes **the previous design-system registry's own baseline** (`1.7.0`), not GC UI acceptance. The list may be incomplete, stale or use historical repository paths, especially for products whose development has moved since October 7.

**Current correction:** The [October 17 live GitHub reconciliation](CURRENT_CONSUMER_RECONCILIATION_2026_10_17.md) supersedes the repository-location guesses below. This remains the immutable historical record of the prior Glaze registry, not a destination list.

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
