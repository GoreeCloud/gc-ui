# GC UI — Component Contract v0.1

The alpha provides **visual reference implementations** in HTML/CSS/JS, not versioned framework packages. All components must remain functionally meaningful when transparency or animations are disabled.

| Pattern | CSS/API | Key states | Accessibility contract |
| --- | --- | --- | --- |
| Action | `.gc-button` + primary/secondary/outline/quiet | default, hover, active, disabled, focus | native button, descriptive text, safe target |
| Icon action | `.gc-icon-button` | default, hover, focus | explicit `aria-label`, title optional |
| Lens panel | `.gc-lens` | translucent, solid, dark, reduced transparency | sufficient effective text contrast |
| Content surface | `.gc-panel` | standard, tonal, dark | never demand backdrop blur |
| Checkbox | `.gc-checkbox` | checked, unchecked, focus, disabled (native) | native `<input type="checkbox">` and associated label |
| Segmented selector | `.gc-segment` | selected/unselected/focus | one selected button, `aria-pressed` status; group label |
| Text field | `.gc-input` | normal, focus, invalid (future), disabled | explicit visible `<label>` and supporting description |
| Slider | `.gc-range` | value change, focus, disabled | native range, readable value label |
| Progress | `.gc-progress` | 0–100% visual fill | `role="progressbar"` and live value attributes for true progress |
| Status | `.gc-status` | success, neutral, danger | text status, not color alone |
| Toast | `.gc-toast` | shown / disappears | polite live region; no focus theft |
| Dialog | `.gc-dialog` | open / closed | native `<dialog>` with name and description |
| Navigation | `.gc-nav`, `.mobile-nav` | current, default, focus | named navigation, active page in `aria-current` |

The experimental `initTabs` controller filters hidden, inert, aria-hidden, disabled and removed tabs from selection and keyboard navigation. When a host inserts new tab and panel nodes, it must remount the controller; when it hides an active tab, it should select an available replacement.

## A working component must meet these criteria

1. Behavior changes meaningfully on activation; disabled actions do not fire.
2. A user can locate and operate it with only a keyboard.
3. States are visible without relying exclusively on color or glass blur.
4. It behaves as expected in light and dark modes, at different zoom levels, and without nonessential motion.
5. Components never import predecessor-system source, themes, tokens or assets; all supported components use the original GC UI contract. See [succession rules](DESIGN_SYSTEM_SUCCESSION.md).

## Mandatory visual acceptance gate

The [GoreeCloud-wide premium UI standard](DESIGN_LANGUAGE.md#mandatory-premium-interface-standard) applies to every component and assembled interface, beyond functional and accessibility acceptance. A technically working but visually generic, flat, unfinished, or boring screen **fails** the design gate.

For each new or materially changed product screen, review and record:

1. **First impression and brand:** Does the screen look modern, premium, distinctive, visually engaging, and unmistakably intentional rather than like an untouched starter template?
2. **Composition:** Are hierarchy, alignment, whitespace, typography, semantic color, surfaces, and purposeful depth harmonious and refined?
3. **Complete experience:** Are navigation, dialogs, menus, controls, data views, onboarding, empty states, loading states, errors, and feedback polished—not just the hero or landing page?
4. **Responsive and theme quality:** Do the relevant phone, tablet, desktop, light, dark, high-contrast, zoomed, and reduced-motion presentations remain coherent and usable?
5. **Accessible function:** Do controls work, convey state, preserve readable contrast, keyboard focus, assistive-technology semantics, and performance? Visual delight never excuses inaccessible behavior.
6. **Reference fidelity and evidence:** Compare against founder-provided visual references and applicable GC UI rules, address visible discrepancies, then verify with current rendered screenshots or implementation evidence. Record gaps explicitly rather than claiming an untested pass.

7. **Founder visual-quality exclusions (November 5, 2026):** Confirm from actual rendered screens that nothing is overcrowded, basic, boring, plain, colorless, misaligned, or ugly. Confirm the complete experience is polished, eye-catching, premium, modern, beautiful, and elegant, with cohesive color, precise alignment, comfortable density, and accessible readability.

**Decision:** Accept only when the reviewer has evidence for visual finish *and* functional/accessibility behavior. Treat failures as actionable defects. Do not claim that a mockup, component demo, or unrelated screen demonstrates product-wide compliance.

## Known alpha limitations

- Buttons and inputs aren't exported as framework-level reusable packages yet.
- Loading and validation states are defined for the roadmap but not wired into all demo controls.
- Current palettes are curated. Automatic personalized tonal palette derivation is not implemented.
- Bidirectional layout, full screen-reader audit, automated visual snapshots and contrast auditing are pending.
