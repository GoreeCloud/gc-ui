# GC UI — automated axe screen-to-lab coverage matrix (November 6, 2026)

**Purpose:** Make existing CI evidence actionable without silently elevating automated screening to human accessibility certification. The new `scripts/build-axe-lab-coverage.mjs` consumes the **same verified, unmodified 27-scenario axe manifest and original manual-review triage** used in the browser quality workflow. It writes `dist/qa/accessibility-coverage/lab-matrix.json` and `lab-matrix.md`; CI uploads both for review.

## Verified historical snapshot

**Source:** current `main` SHA `dd19f18f25f15eaf4071d29fe5efc9db8d8c35e1` and [passing browser quality run 42320404522](https://github.com/GoreeCloud/gc-ui/actions/runs/42320404522) retaining `gc-ui-browser-qa-evidence` with the real raw `accessibility-review/manifest.json`, 27 source reports and `accessibility-triage/manual-review.json`. Read-only running the new builder on this downloaded official archive gives:

| Experimental lab | Axe screens | Incomplete rule checks | Incomplete node occurrences | Distinct unresolved review targets |
| --- | ---: | ---: | ---: | ---: |
| Adaptive | 5 | 5 | 56 | 22 |
| Catalog | 1 | 1 | 29 | 29 |
| Components | 5 | 10 | 75 | 36 |
| Environment | 3 | 3 | 41 | 20 |
| Experience Studio | 3 | 2 | 28 | 14 |
| Forms | 5 | 5 | 19 | 7 |
| Icon Atlas | 1 | 1 | 13 | 13 |
| Motion Gallery | 1 | 1 | 14 | 14 |
| Pattern Workbench | 1 | 0 | 0 | 0 |
| v1 Foundations Lab | 2 | 2 | 47 | 27 |
| **Total** | **27** | **30** | **322** | **182** |

**Independent local replay:** On the same exact source revision, `npm run test:e2e:accessibility` passed **27/27 Chromium cases**, then `qa:accessibility-evidence:verify`, `qa:accessibility:triage` and `qa:accessibility:coverage` each passed. Its locally generated source revision field was `null` because no hosted `GITHUB_SHA` was supplied; the 27 source reports, their digests and all 322 unresolved occurrences were preserved. Hosted exact-PR-head validation still governs eventual merge.

The latest source triage categories retain **13 possible-obstruction targets / 21 occurrences**, **1 ARIA-relationship target / 5 occurrences**, **150 composited-background targets / 240 occurrences**, **1 unresolved text/control target / 1 occurrence**, and **17 non-text-symbol targets / 55 occurrences**. These categories are source-derived **manual-review priorities, not verified violations**. Their totals do not imply 182 independent UI defects. In particular Pattern Workbench's zero incomplete axe nodes **does not establish** human accessibility or whole-screen WCAG compliance.

## Reproducibility and failure conditions

The builder verifies raw manifest SHA-256 against the existing triage `sourceManifestSha256`; confirms the manifest was not silently rewritten; reconstructs the full original triage via `buildTriage`; rejects missing, extra or duplicate screen state IDs, negative/corrupt counts, unknown page paths, invalid record digests, triage targets associated with other pages, missing occurrences, or any disposition other than `manual-review-required`. It preserves exact per-state report SHA references and includes modality fields that explicitly say *not established by axe evidence* for human screen-reader, real device, keyboard/focus, translated RTL, and zoom/reflow. Independently reported historical manual AT results remain valid in their own dated evidence; this is **not a rewrite of those results**.

The output is generated **only after** the existing `qa:accessibility:triage` step and before the browser suite stages/restores its reports. Tests in `tests/axe-lab-coverage.test.mjs` enforce count integrity and rejection of tampering. The aggregate JSON and Markdown are CI QA artifacts, not a new public UI component, package export, normative stable release gate, or accessibility certificate.

## Next acceptance priorities

1. Manually inspect and resolve the remaining relevant obstruction and non-text visual findings, recording real rendered screenshots, page and states; preserve every unverified axe item as inconclusive until qualified evidence supports a disposition.
2. Work toward the [competitive-research objective](https://drive.google.com/file/d/1BaJ4LC0xvOH13ch8K8qWkUS6pLwaED_x/view) of **component × state × modality** evidence, building outward from this *lab-level* screen coverage instead of fabricating per-component test coverage.
3. Keep the higher-level human screen-reader, actual mobile virtual keyboard, localized RTL and whole-product premium visual acceptance tasks OPEN. Historical owner-reported manual test results have their original provenance and are not negated by missing automated modality data.

**Caution:** Neither the 27-screen inventory nor green source/Chromium/Firefox CI certifies WCAG 2.2 AA, voice/speech equivalence, physical-device parity, authorization to release, or completed consumer migration. Final verification requires exact-PR-head hosted CI and current `main` readback before any integration claim.
