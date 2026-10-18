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

## Near-term technical backlog

- [ ] Implement contrast verification for all palette-role pairs and system modes.
- [ ] Create a first-class `GCButton`, `GCField`, `GCLens`, `GCDialog` component API.
- [ ] Improve personalization support on mobile, including accessible palette controls.
- [ ] Add density switch and synchronized token reference documentation.
- [ ] Audit illustrations and the GC mark for scalability, brand uniqueness, and small-size rendering.
- [ ] Add automated browser interaction and screenshots to CI.
- [ ] Design a dedicated iconography and glyph grammar.
- [ ] Document adaptive navigation rules by device family.
