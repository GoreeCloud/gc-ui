# GC UI Experience Studio — QA checkpoint (2026-10-17)

**Repository scope:** GoreeCloud/gc-ui only. **Release maturity:** Experimental alpha. This document reports verified implementation evidence, not accessibility certification, native device readiness or stable API approval.

## Implemented
- Three original monochrome/semantic-color local SVG scene symbols: workspace, reading, analysis. No new third-party image licenses or remote assets.
- Four static depth tiers E0–E3, context/intent capping, high-contrast and forced-colors overrides, reduced-transparency and explicit low-power constraints. E4 is reserved at the normative spec level and not implemented here.
- Bounded choreography across a maximum of three visible DOM groups, with 0–45ms stagger, cancellation on interruption and on live OS accessibility preference changes, and teardown lifecycle.
- Seven explicit platform design profiles: responsive web, phone, tablet, desktop, TV, wearable and spatial. These are not native SDK adapters, remote-focus engines or hardware detection.
- Experience Studio reference lab, reusable CSS, typed API exports, local original SVG source and documentation.

## Local verification on authorized Linux desktop
- **106/106 unit/source tests passed** via npm run check; token CSS reproducibility verified.
- **722 generated themes, 7,988 semantic color-pair checks, zero failures** in the existing opaque role audit. This does not prove every new composited surface meets contrast.
- **114-file npm dry-run**, including both new package exports (depth CSS and original scene sprite); all **20 required export targets** present.
- **35/35 targeted Chromium browser tests passed** covering Studio interactions, four visual screenshot capture states, axe WCAG A/AA smoke checks across reference labs, larger text and RTL reflow.
- **48/48 Chromium interaction tests passed** in a subsequent isolated run across all reference labs and the Studio.
- **2/2 targeted Firefox tests passed** for scene/platform behavior, mobile layout, reduced motion and forced-colors.
- Desktop light, desktop dark reading, and 375px mobile full-page screenshots were captured and inspected, with no horizontal overflow or page errors. Screenshots are qualitative evidence, not approved pixel-diff baselines.

## Browser harness note
An initial overlapping Chromium and Firefox run shared the same Playwright test-results directory and caused two test teardown errors when recorded trace files were removed by the other run. Neither failed a UI assertion. Both were rerun with browser suites executed sequentially; the full Chromium interaction suite passed 48/48. Separate result directories are recommended before scheduling multiple Playwright processes concurrently.

## Unverified release gates
- Native host SDK bindings for Android, iOS, TV, wearables and spatial computing are not supplied.
- Manual TalkBack/VoiceOver/Orca acceptance for the new Studio, Safari and real-device rendering, reduced-data browser support, and power/GPU profiling remain open.
- Original scenes still need platform art direction review at multiple sizes and themes.
- Composited background contrast, translation expansion, full localization and visual regression baseline approval need separate signoff.
- Third-party license inventory remains separate and unchanged by the original GC scenes.

**Conclusion:** Suitable as an experimental GC UI reference milestone and as a basis for further integration work; not a claim of production readiness.
