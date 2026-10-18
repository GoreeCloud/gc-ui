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

## A working component must meet these criteria

1. Behavior changes meaningfully on activation; disabled actions do not fire.
2. A user can locate and operate it with only a keyboard.
3. States are visible without relying exclusively on color or glass blur.
4. It behaves as expected in light and dark modes, at different zoom levels, and without nonessential motion.
5. Components never import predecessor-system source, themes, tokens or assets; all supported components use the original GC UI contract. See [succession rules](DESIGN_SYSTEM_SUCCESSION.md).

## Known alpha limitations

- Buttons and inputs aren't exported as framework-level reusable packages yet.
- Loading and validation states are defined for the roadmap but not wired into all demo controls.
- Current palettes are curated. Automatic personalized tonal palette derivation is not implemented.
- Bidirectional layout, full screen-reader audit, automated visual snapshots and contrast auditing are pending.
