# GoreeCloud UI — Human AT and real-device acceptance protocol

**Status:** Acceptance worklist; no human or physical-device results are claimed by this file.  
**Scope:** Current alpha web reference lab, not native-app parity, all consumers, regulatory certification, or a Stable release.  
**Authority:** Founder-approved GoreeCloud UI Design Language + 100 Principles and `docs/VISUAL_QUALITY.md`.  
**Machine-readable scenario inventory:** [registry/acceptance-matrix.v1.json](../registry/acceptance-matrix.v1.json).

## What counts as evidence

Automated Node tests, browser ARIA snapshots, CI screenshots, emulators, virtual displays and agent-led keyboard checks are **useful technical evidence**, but do not count as **human assistive-technology testing** or **physical-device visual acceptance**. A human using Orca, NVDA, VoiceOver or TalkBack must actually traverse the running UI for a human-AT result. A physical device must actually display the exact build for device acceptance. Founder-authorized AI testing is valid as AI-performed testing but must not be represented as human.

Every record must name a **specific scenario**, exact source/build SHA, test date/time, browser version, OS version, AT/version when applicable, device class/resolution, input method, selected theme/accent and accessibility settings. Record actual outcome as `pass`, `fail`, `inconclusive`, `not-tested` or `not-applicable` (with reason). A failure must include a reproduction, impact and tracking issue; an inconclusive finding must remain open. A pass needs repeatable observations and evidence, not a tick alone.

Do not record users' names, accounts, search terms, precise location, tokens, screenshots of private apps, or hardware serial numbers. Use a disposable demonstration profile and scrub sensitive identifiers before preserving evidence. Do not enable data collection, location permission, external tile requests or other privacy-sensitive capabilities merely to test UI styling.

## Execution order

1. **Baseline.** Check out the exact commit and run `npm run check`, `npm run verify:package`, and `npm run browser:smoke` in a reviewed disposable environment. Record CI run URLs and artifact hashes separately from manual results.
2. **Visual matrix.** On actual supported desktop/mobile equipment, inspect the **entire visible UI** at desktop, tablet and handset sizes where physically available, in light/dark modes and supported accent families. Include initial, focus, hover, selected, loading, error, empty, disabled, offline/recovery and dialog states. Check typography, layering, contrast, labels, visual hierarchy and practical touch targets. Test 200% text and 400% real zoom, reduced motion, increased contrast, forced colors where supported and landscape/safe-area behavior.
3. **Keyboard.** Walk the page from top to bottom using only Tab/Shift+Tab, arrow keys, Home/End, Enter, Space and Escape. Verify visible focus, meaningful control actions, no traps, and focus return from overlays. Repeat with RTL document direction where relevant.
4. **Human assistive technology.** Perform the registry's exact screen-reader scenarios on **supported physical systems**. Check control names, roles, states, relationships, disabled cues, announcements, reading order, list/table structure and focus recovery. Human observers record **what was actually spoken or exposed**, including mismatches.
5. **Consumer acceptance.** Migrate one authorized application at a time using approved semantic tokens and supported components. Record before/after full-screen evidence on the same dimensions, behavior and data flow; run per-consumer tests and verify security/consent did not regress. Keep the migration at development-preview status until its own acceptance.
6. **Triage and repeat.** Fix material defects in source, rerun the affected matrix and verify the same build on the relevant device. Do not silently convert `not-tested` or `inconclusive` to pass.

## In-session baseline (November 11, 2026)

- `GoreeCloud/gc-ui` main `1c173d64d966b52122ac02eb0ffbd07d2a5a09e4` had a successful integrated `GC UI quality` workflow [43023543199](https://github.com/GoreeCloud/gc-ui/actions/runs/43023543199); this is automated evidence only.
- Remote Desktop Commander reported an authorized laptop intermittently offline, and two online Linux VPS agents without a graphical display, `adb` or USB inventory tooling. No physical handset or human AT session was operated during this record's preparation.
- **Every manual scenario remains `not-tested`.** Do not infer manual approval from the existence of this checklist or a successful CI run.

## Acceptance review

When real evidence is available, update the matching registry entries only after replay and check that all `pass` entries include non-empty evidence and a dated reviewer/build record. Keep unsupported platforms marked `not-tested` or reasoned `not-applicable`, not falsely certified. Link unresolved failures to the repository's [visual/AT acceptance issue](https://github.com/GoreeCloud/gc-ui/issues/7), [interaction hardening issue](https://github.com/GoreeCloud/gc-ui/issues/37) or a narrowly scoped defect.

## November 13, 2026 — source-complete, device-acceptance-open additions

The source now contains **Signal Constellation, linked Timeflow, independent per-application appearance, and optional frosted Cloud Lens**. Automated Chromium and package checks on the shared library do not establish physical-device or human-assistive-technology results. The machine-readable acceptance matrix now separately tracks five specific `not-tested` scenarios: Windows/NVDA status filtering after selected filter disablement, iOS/VoiceOver chronological Timeflow, Android/TalkBack independent appearance/transparency, Windows/Chrome **actual browser zoom** at 200% and 400%, and Windows high-contrast forced colors with sibling application themes.

For actual 400% browser zoom, capture the **browser zoom setting** as evidence; a CSS root `font-size:400%`, reduced viewport width or emulated device scale does not establish that behavior. Keep related [issues #7](https://github.com/GoreeCloud/gc-ui/issues/7), [#28](https://github.com/GoreeCloud/gc-ui/issues/28) and [#37](https://github.com/GoreeCloud/gc-ui/issues/37) open until their distinct acceptance requirements are independently met. Do not record a pass without a reproducible real-client observation.
