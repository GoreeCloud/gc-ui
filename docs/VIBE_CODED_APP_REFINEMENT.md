# GoreeCloud — Vibe-Coded Application Refinement Playbook

| Document field | Value |
| --- | --- |
| Type | Implementable cross-product design and acceptance guidance |
| Prepared | 2026-11-15 |
| Status | Implementation guidance; consumer adoption and visual signoff require evidence |
| Authority | Canonical GoreeCloud UI and founder-controlled Drive standards |
| Owner | GoreeCloud founder |
| Applies to | GoreeCloud-controlled web, desktop, mobile, windowed, and service interfaces |

## Purpose

Replace generic AI-produced presentation with intentionally art-directed, functional, accessible and visually exceptional product experiences. Source generation method is irrelevant: a hand-written template can fail the same tests. The twenty disciplines below are **not** permission to change approved GoreeCloud branding, typography, colors, token values, identity artwork, or platform conventions.

Authoritative references:
- [Exceptional craftsmanship and anti–AI-slop standard](https://drive.google.com/file/d/1IAcE_0j-FGu_qi3nhzfHvDINfuI_lVVR/view)
- [Mandatory professional visual-quality audit](https://drive.google.com/file/d/1Xd1ByJUThNg20WurGV_7kQPkNkTMtSPZ/view)
- [Floating navigation](https://drive.google.com/file/d/1Sh4JTGPM49gWk0VrqVDQN1qJ7ZkBJl0k/view) and [rounded UI](https://drive.google.com/file/d/1JXamkBbF9T1EZIMDhcthmQV6ewLSQmTZ/view)
- [GC UI premium visual quality contract](VISUAL_QUALITY.md), [Browser QA](BROWSER_QA.md) and [canonical token authority](../registry/design-authority.v1.json)

## Ranked improvement disciplines

| ID | Priority | Improvement | What the reviewer must establish |
| --- | --- | --- | --- |
| VQ-01 | critical | **Product identity** | Distinctive product-specific identity without interchangeable SaaS treatment |
| VQ-02 | critical | **Application shell** | Intentional sidebar, titlebar, window chrome, toolbar and content hierarchy |
| VQ-03 | major | **Typography** | Clear typographic roles, optical alignment, wrapping and readable scale |
| VQ-04 | major | **Spacing and proportions** | Token-governed rhythm, balanced density and precise alignment |
| VQ-05 | critical | **Design-system integrity** | Verified GC UI tokens, components and approved patterns; no arbitrary branding |
| VQ-06 | critical | **Information hierarchy** | Recognizable primary tasks, meaningful content grouping and visual focal points |
| VQ-07 | major | **Color and materials** | Semantic contrast and purposeful Canvas, Surface and optional Lens |
| VQ-08 | major | **Depth and layering** | Restrained coherent elevation without decorative shadow or glow overload |
| VQ-09 | critical | **Navigation quality** | Floating app-controlled nav, discernible active state, clear grouping and reachability |
| VQ-10 | major | **Iconography** | Coherent original glyph treatment, optical sizing and accessible labels |
| VQ-11 | critical | **Layout originality** | Workflow-specific arrangements; no unjustified repetitive card farm |
| VQ-12 | major | **Microinteraction polish** | Trustworthy hover, press, focus, selected, disabled and busy feedback |
| VQ-13 | major | **Motion language** | Purposeful transition timing with accessible reduced-motion alternative |
| VQ-14 | major | **Component finish** | Refined buttons, inputs, tables, menus, dialogs and window controls |
| VQ-15 | critical | **Non-ideal states** | Designed empty, loading, error, offline, denied and recovery workflows where applicable |
| VQ-16 | major | **Authentic imagery** | Purposeful original and licensed assets; no generic emoji or deceptive placeholders |
| VQ-17 | critical | **Responsive and native fit** | Real platform layouts, window resizing, breakpoints, safe areas and text zoom |
| VQ-18 | major | **Pixel-level precision** | Aligned baselines, consistent radii, borders, clipping and visual details |
| VQ-19 | critical | **Content authenticity** | Relevant real or clearly labeled sample data; no fictional telemetry or inert controls |
| VQ-20 | critical | **Rendered visual audit** | Whole-workflow screenshot-led inspection, corrective iteration and reviewer disposition |

**Interpretation:** “critical” is a review priority, not a claim of vulnerability or a newly approved release classification. Checklist completion cannot certify subjective beauty or real-device accessibility.

## Implementation sequence

1. **Inspect before designing.** Review current authoritative GC UI tokens, the app's real source, running screens, user workflows, existing assets, supported platforms and defects. Confirm identity and native UI stack requirements; do not invent a universal accent, font, or new logo.
2. **Establish an art-direction brief.** State the product's distinctive purpose, primary task and information hierarchy. Identify two or three compositional decisions that distinguish it from unrelated apps while retaining the ecosystem design language.
3. **Refine the whole shell.** Correct app frame, sidebar, top/navigation bars, toolbars, WCN where applicable, content density, typography, grouping and scrolling. Prefer real interaction over ornamental hero sections.
4. **Implement state completeness.** Use approved shared controls for default, hover, active, keyboard focus, loading, disabled, empty, error, offline and recovery. No fake clicks, simulated permissions, imaginary telemetry, or unsanitized customer screenshots.
5. **Recompose by platform.** Design mobile/tablet/desktop and applicable native window behavior deliberately. Respect universal rounded elements and floating app-owned navigation; test actual text growth, RTL, themes, contrast, reduced motion/transparency, focus and screen-reader semantics.
6. **Inspect rendered evidence.** Capture sanitized real screenshots (no secrets or personal records) for representative supported viewports, appearances and states; manually review each full workflow, not just a hero. Iterate after every visible defect.
7. **Record acceptance honestly.** Link source SHA, explicit conditions, reviewer, image hash, criterion outcomes, unresolved defects and disposition. Distinguish code commit, automated gate, human visual signoff, adoption and deployment.

## Anti-template rejection questions

- If the app name were replaced, would the layout be indistinguishable from unrelated SaaS software?
- Are repeated metrics, cards, pills, gradients and hero patterns used for convenience instead of the task?
- Does added blur/glow obscure weak hierarchy or reading content?
- Are sidebars, window controls, forms, menus, settings, onboarding and error states as considered as the main screen?
- Are labels, icons, contrast, spacing, density and interactive states still coherent at true small widths and increased text sizes?
- Does every apparent action have an implemented behavior or honest unavailable-state explanation?

Any **yes** to a defect question needs a location, severity, correction and evidence, not a vague opinion. A restrained utility is allowed to be quiet; distinctive does not require noisy decoration.

## Implemented review tooling

The versioned [20-point rubric](../registry/visual-quality-rubric.v1.json) is validated with:

```bash
npm run visual:rubric
npm run visual:review -- --init /tmp/gc-visual-review.json
npm run visual:review -- --gate /path/to/review.json
```

The initializer writes an **unreviewed** scaffold and refuses to overwrite a file. To pass a gate, add a real reviewer, Git source SHA, genuine validated screenshot evidence and dispositions for every criterion. The gate checks report consistency, local image provenance and declared device/appearance coverage. It cannot judge art quality; human inspection and applicable release gates remain mandatory. Do not place private screenshots in a public repository.

## Evidence report contract

- `product` and `sourceSha` identify the actual inspected app and source state.
- `reviewer` and `reviewedAt` identify who reviewed it and when; values must not be fabricated.
- `supportedFormFactors` and `supportedAppearances` declare what was actually reviewed.
- `surfaces` enumerate inspected screen/state/viewport conditions and an actual PNG, JPEG or WebP file with a matching SHA-256. Screenshot paths resolve relative to the report directory.
- `criteria` provides one outcome per VQ-01…VQ-20. `pass` requires notes and named evidence-backed surfaces; `not-applicable` requires a real rationale; `fail` and `not-reviewed` prevent approval.
- The gate is **not** a license, publication decision, deployment, accessibility certification or proof that AI-generated output is visually acceptable.

## Consumer rollout and release boundary

Start with high-visibility shells and problematic screens in each active app; reuse GC UI primitives and platform-native adapters, not identical dashboards. Preserve verified functionality and respect privacy via GoreeShield, security via Wardveil, Mesh interoperability and Identity enforcement. Consumer migration requires separate PRs, real screenshots, manual acceptance, rollback and release criteria. This playbook alone has **not** migrated or visually approved any downstream application.
