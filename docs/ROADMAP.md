# GC UI — Roadmap

This roadmap tracks **GC UI implementation**. The owner has selected GC UI as the **exclusive permanent successor** to Glaze; see [design-system succession](DESIGN_SYSTEM_SUCCESSION.md) for the separate evidence-gated governance/consumer retirement work. The old design system is not a dependency of the destination.

| Phase | Focus | Release conditions |
| --- | --- | --- |
| **0.1 Foundation Alpha — started** | Original identity, three material layers, seed palettes, modes, type/space/shape/motion foundations, reference playground | Local demo works; draft token contract and tests exist |
| 0.2 Foundations Hardening | Contrast-audited tonal scales, token generator, RTL direction, high contrast, richer density controls, icon grid | Automated color audit + visual regression |
| 0.3 Components | Navigation, buttons, menus, text input, selection, overlay, toast, progress, cards, data display; all states | Keyboard and screen-reader audits for every primitive |
| 0.4 Motion and Adaptation | Responsive composition, fluid interactive states, desktop/tablet/mobile/TV/watch/spatial concepts | Reduced-motion parity and input modality validation |
| 0.5 Packages and Docs | Framework-neutral CSS package, Web Components or selected framework bindings, story-driven showcase | Versioned APIs, examples, tests, usage docs |
| 0.9 Beta | Design QA, internationalization, cross-browser audits, performance budgets | WCAG 2.2 AA gate and system consistency signoff |
| 1.0 Stable | Public token/component API and migration documentation | Stable release checklist and compatibility guarantees |

## Implementation evidence checkpoint — 2026-10-21

This is a **status reconciliation**, not a release or accessibility certification.
The phases above describe the complete GC UI product roadmap; they do not imply
that the private experimental root workspace has reached 1.0 Stable.

| Capability | Verified implementation evidence | Still outside the accepted scope |
| --- | --- | --- |
| Token/color/theming Foundations | [Public GitHub Foundations v1.0.1](https://github.com/GoreeCloud/gc-ui/releases/tag/foundations-v1.0.1), exact-source checksum and packaged consumer/type/browser contracts; [scoped release status](IMPLEMENTATION_STATUS.md) | Stable **Foundations subset only**; root `0.2.0-alpha.1` remains experimental and private; no npm registry publication |
| Responsive navigation, forms and interaction controllers | [Lab contracts](COMPONENTS.md), unit tests, Chromium/Firefox interaction suites, [adaptive navigation rules](ADAPTIVE_SHELL.md) | Versioned, fully supported high-level GCButton/GCField/GCLens/GCDialog component APIs and platform-wide assistive-technology acceptance |
| Browser interaction, visual evidence and reflow | [Hosted quality workflow](../.github/workflows/ci.yml) runs Chromium/Firefox, responsive and accessibility checks, automated screenshot collection, and genuine 200%/400% browser zoom | Screenshot evidence is **not** human visual signoff or a universal WCAG certification; manual AT and broader supported-device review remain separately scoped |
| Iconography and adaptive platform previews | [Component catalog](COMPONENT_CATALOG_V1.md), [icon contract](ICONS_LIBRARY.md) and [native host notes](NATIVE_HOSTS.md) | Brand uniqueness/small-size approval and all future TV/watch/spatial deliverables are not inferred from previews |
| Ecosystem design-authority cutover | [Version-controlled consumer handoff](CONSUMER_MIGRATION_HANDOFF.md) contains 18 dated consumer records and next verification steps | **0/18 migrations accepted**; governance supersession, runtime adoption, legacy retirement and final exclusive cutover remain four independent blocked gates |

**Strategic priority order:** (1) finish accessible and versioned controls actually
intended for the next scoped release, including error/disabled/teardown states;
(2) close measurable mobile personalization, RTL, density and visual QA gaps
against supported-device contracts; (3) request separately authorized,
revision-pinned consumer evidence and governance decisions before any
ecosystem-wide compliance or retirement claim. Keep optional broad platform
experiments distinct from stable-scope release gates.

## Near-term technical backlog

- [ ] Implement contrast verification for all palette-role pairs and system modes.
- [ ] Create a first-class `GCButton`, `GCField`, `GCLens`, `GCDialog` component API.
- [ ] Improve personalization support on mobile, including accessible palette controls.
- [ ] Add density switch and synchronized token reference documentation.
- [ ] Audit illustrations and the GC mark for scalability, brand uniqueness, and small-size rendering.
- [x] Add automated browser interaction and screenshot capture to CI (implemented; human visual review remains pending).
- [ ] Design a dedicated iconography and glyph grammar.
- [ ] Document adaptive navigation rules by device family.
