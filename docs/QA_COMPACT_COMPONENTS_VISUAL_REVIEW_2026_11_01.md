# GC UI — compact Components Lab rhythm review (2026-11-01)

**Scope:** experimental `lab/components.html` only; **status:** scoped visual refinement, not product-wide visual acceptance or Seal approval.

## Observed issue and correction

The prior 375px full-page Components Lab screenshot exhibited disproportionate blank vertical bands between the introduction, personality controls and primitive examples. Source confirmed phone-only hero spacing of 92px above / 66px below and section spacing of 40px above / 86px below. These were not required for touch accessibility or layout reflow.

The phone-width refinement (up to 520px) keeps the established typography, semantic surfaces, rounded corners and visual hierarchy while reducing the hero to 68px above / 50px below and sections to 28px above / 54px below. It does **not** alter desktop/tablet spacing, component contracts, controller behavior, tokens or published artifacts.

## Verification protocol

- Check actual generated full-page `components-mobile-light.png` visually against the prior image, including the entire visible interface and not only the altered gaps.
- Browser-check the geometry at widths 320, 375 and 520px, plus unchanged 600px layout; verify no horizontal document overflow, anchor scroll targets clear the sticky header and headings remain visible.
- Run the relevant Chromium/Firefox browser suites, full visual inventory and source/pack gates at the exact proposed revision.
- Retain the screenshots and test reports as **evidence**, not a blanket accessibility certification. Preserve known axe incomplete items and separate the unpublished opt-in web Seal candidate from this experimental lab visual polish.

**Governing sources:** `GoreeCloud/GoreeCloud-Instructions.md` §§5.4 and 16.2.1; `docs/DESIGN_LANGUAGE.md`; stabilization issue #78.
