# GoreeCloud UI — Legacy consumer migration audit

**Owner destination:** GC UI permanently replaces Glaze.
**Scope of this tool:** an **explicit, read-only checkout** the operator has authorized for inspection. This does **not** authorize editing another repository or any Google Drive file.

## Run a bounded source audit

From `GoreeCloud/gc-ui`:

~~~sh
npm run migration:audit -- --root /absolute/canonical/path/to/authorized/consumer
npm run migration:audit -- --root /absolute/canonical/path/to/authorized/consumer --json
npm run migration:audit -- --root /absolute/canonical/path/to/authorized/consumer --json --strict
~~~

No root path is inferred. The auditor **does not execute files, change imports, install packages, write findings into the consumer, follow symlinks, or access the network**. The bounded source scan includes JavaScript and TypeScript module variants `*.mjs`, `*.cjs`, `*.mts`, `*.cts` (and declaration module forms such as `*.d.mts` and `*.d.cts`), Astro `*.astro` templates, and UTF-8 SVG `*.svg` asset source. SVG text is scanned without rendering, loading external resources, or executing scripts; oversized or undecodable SVG text marks a scan incomplete rather than clean. A lone legacy import in one of these files blocks a strict clean exit; no results are promoted to consumer acceptance. Legacy abbreviated `glz-` component names, styles and asset filenames are also inspected even without the full Glaze name. Invalid UTF-8 in a recognized text file is reported as `incomplete` (strict exit 3), never treated as absence of legacy evidence. It only reads text and returns relative paths, line numbers and classifications (no source excerpts). Common generated/dependency folders are excluded; symlinks, uninspectable text or hard capacity limits make the result `incomplete`.

| Strict exit | Interpretation |
|---|---|
| `0` | No active/review-required predecessor references detected in successfully inspected text; **not** proof of GC UI adoption |
| `2` | Explicit legacy package/import/token/component/asset evidence, or source references requiring human review |
| `3` | Scan incomplete, for example because a symlink or oversized file was skipped; may also contain positive findings |
| `4` | Invocation error, invalid path or unsupported options |

**Report model:** `gc-ui-consumer-audit.v1` with `status`, `scan`, `totals`, `findings` and `incomplete`. `consumerConformant` and `migrationComplete` are always `false`: a static source scan alone cannot verify rendered UX, native/platform conventions, privacy, accessibility, packaging or runtime cutover.

Top-level `acceptance/` and `evidence/` Markdown, JSON and YAML records are informational provenance, not active source dependencies, but executable scripts in those directories still count as active. See the [read-only Website feature-branch probe](QA_WEBSITE_LEGACY_PROBE_2026_10_17.md) for a practical example; its results are **not** current-main adoption evidence.

Historical prose in `.md` and `.txt` is nonblocking by default. Documentation containing an import or old token instruction is marked for review. Code mentions outside recognized imports are likewise review-required. Names of legacy binary assets are detected without opening their bytes. Case-specific findings can include false positives; review each before taking action.

A [generated migration evidence handoff](CONSUMER_MIGRATION_HANDOFF.md) groups all 18 dated products by the next authorization or verification required. Regenerate with `npm run migration:handoff:render` and check the committed report with `npm run migration:handoff:check`. It remains a **read-only 2026-10-17 snapshot**, not evidence that a later consumer `main` has been inspected or adopted GC UI.

## Current live source destinations

Use the [October 17 provider-verified reconciliation](CURRENT_CONSUMER_RECONCILIATION_2026_10_17.md) and [machine-readable ledger](../registry/consumer-migration-reconciliation.v1.json) before selecting consumer source. Check integrity with `npm run migration:reconcile:check`. Do not use the old source paths in the legacy registry as current destinations.

## Dated starting inventory, not current deployment proof

The predecessor's [October 7 registry snapshot](CONSUMER_MIGRATION_INVENTORY_2026_10_17.md) lists 18 historical product entries across 15 repos, but cannot establish present source locations or GC UI adoption. Verify each current canonical repo before auditing or changing it.

## Semantic mapping — controlled, not mechanical

This mapping identifies the *conceptual destination*. It is not a token-by-token compatibility guarantee or an automatic source transformation.

| Legacy Glaze concern | GoreeCloud UI destination | Migration proof |
|---|---|---|
| Shared design authority / release baseline | [GC UI authority registry](../registry/design-authority.v1.json) and [exclusive succession](DESIGN_SYSTEM_SUCCESSION.md) | Active governing policy superseded in authorized Drive records, per-consumer adoption evidence |
| Six-level historical material hierarchy | GC UI **Canvas, Surface, Lens** semantic planes | Intentional UX mapping; verify correct solid surfaces, bounded transient Lens, contrast and accessibility; **not** a 1:1 material rename |
| Old token names, stylesheets and CSS variables | GC UI `--gc-` / `--gc-v1-` semantic roles, token JSON and generated CSS | Token intent + mode + on-color pairs validated, all old imports removed |
| Historical components and behaviors | GC UI component catalog with **explicit web/native maturity** | Match actions, focus, keyboard, state and form-factor behavior; `specified` or `experimental` does not mean stable |
| Old transitions, adaptive navigation and native wrappers | GC UI motion/input contracts and platform-specific adapters | Reduced motion, accessibility, responsive/navigation and native host verification |
| Old icons, artwork and identity elements | Only original/appropriately licensed GC UI assets | Correct source provenance, redistribution licenses and original brand authority retained |
| Old shared package or runtime imports | Scoped supported GC UI package API (currently only private Foundations RC) | Actual tested consumer install and runtime integration, not a string replacement |

### Per-consumer acceptance protocol

1. Record exact repository, ref/commit, scan run and **all** explicit legacy imports/token paths; identify which findings are active versus historical.
2. Document the shipped product's target GC UI subset, the current status of each component (specified, experimental, stable), runtime/browser/device support, and whether a temporary **explicitly expiring** migration bridge is needed.
3. Implement original semantic replacements in the **consumer's separately authorized repository** and audit included assets for license compatibility. Never blindly relabel predecessor resources.
4. Repeat strict inventory and verify the **actual target package** at its exact commit/build, plus behavioral interaction, accessibility, security and responsive UI checks appropriate to what ships.
5. Record consumer owner acceptance, rollout/rollback, compatible release identity and removal of live legacy imports before changing the central consumer registry. No source-audit-only status may be counted as a production migration.

**Status as of 2026-10-17:** the auditor and tests exist in `GoreeCloud/gc-ui`; no authorization has been used to modify another consumer. The owner decision is final, but existing Glaze conformance governance and downstream app adoption are **not yet superseded/verified**. This remains separate from the scoped Foundations release candidate and from unnecessary hardware-only gates.

## Authoritative governance requiring future supersession

The following were inspected read-only in GoreeCloud Google Drive; dates reflect source metadata, not new approval:

- [Policy — Glaze Application Conformance, active v2.2](https://drive.google.com/file/d/1N4x94phDAgPKGShzTlE4R0CPCM5a8f9U/view) presently points consumers to the previous 1.7.0 Anchor baseline.
- [Standard — Glaze V1.7+ Universal Interface and Design](https://drive.google.com/file/d/1dQj4rEwPvyGsmgXZdJvFZUWpO-19_ho6/view) currently enforces the older material and component vocabulary.
- [Standard — Platform Enforcement and Conformance](https://drive.google.com/file/d/1EUd6VNDRIY9lRu5N16l-rk0EoGUTo4zY/view) discusses source-verified checks; some sections explicitly describe *proposed*, not deployed, enforcement.
- [Policy — Software Licensing](https://drive.google.com/file/d/11G_IawJj7ilRSroX7uSDdGtI44F3aCMa/view) is the governing project-specific license selection authority. GC UI remains `UNLICENSED` until a documented project decision.

These documents **have not been modified** by this work. A migration plan stored in GC UI does not silently supersede their current authoritative versions.
