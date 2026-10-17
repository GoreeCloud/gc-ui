# GC UI — Adaptive Layout, Navigation & Platform Patterns
## 1. Adapt by available space, not brand of hardware
GC UI breakpoint tokens (CSS/container logical px):
| Range | Width | Primary composition | Navigation |
|---|---|---|---|
| compact | <600 | 1 column; 16px gutters | bottom nav 3–5 destinations; full-screen subflow |
| medium | 600–839 | 1–2 columns; 24px gutters | rail or modal drawer |
| expanded | 840–1199 | 2–3 columns; 24–32px gutters | rail or compact sidebar |
| wide | 1200–1599 | 2–4 columns; 32px gutters | persistent sidebar / dual-pane |
| ultrawide | >=1600 | multi-pane bounded reading areas; 40–48px gutters | sidebar + inspector; do not stretch line length |
Breakpoints are approximate *container* thresholds, not rigid device classifiers. Combine container queries with viewport safe areas, actual font scale, input capabilities, window segments/hinges and aspect ratio. Component responsive collapse is triggered when its **own content** no longer fits.

## 2. Grid and spacing
Use a 4px base spacing system and 12-column wide grid; 8 columns in medium; 4 in compact. Gap 12–16 compact, 20–24 medium, 24–32 expanded. Major surfaces max 1200–1440px content canvas for productivity with optional secondary inspector; editorial bodies max 75ch. Reserve 16–24px safe margins from viewport or display cutouts. Keep scroll region singular when possible; nested scroll must be intentional.

## 3. Navigation information architecture
- Product frame: global destinations, search, user/context menu, application-wide notices.
- Workspace: collections, filters, contextual actions.
- Detail: item data, local tabs, edit flow and feedback.
- Action: safe execution, progress, undo, error recovery.
Maintain location cues via selected nav and title. Use breadcrumbs when hierarchy is >2 levels and path matters. Preserve back stack and in-progress form state across window size changes; don't reset destinations when bottom nav morphs to rail.

## 4. Per-form-factor design
**Phone:** bottom nav 3–5 short, labeled destinations. Primary action near reachable area where task demands it, keyboard-safe. Sheets for short choice tasks, full-screen for complex forms. Content never hidden beneath fixed Lens dock.  
**Tablet:** rail or resizable sidebar, dual-pane overview/detail, sheets or anchored popovers; portrait/landscape recalculates.  
**Foldable:** query fold posture and occlusion when available; don't put controls on hinge or across an unusable seam. Dual-pane in book posture; preserve focus and form entries when changing posture.  
**Laptop/Desktop:** hover and right-click enhancements, persistent sidebar, resizable split panes, standard menu command equivalents and shortcuts; no swipe-only actions.  
**Ultrawide:** main work region anchored with side inspectors, rather than huge stretched cards. Reading width stays bounded.  
**TV/10-foot:** visible selected focus always; 64px+ target guidance, high relative type size, short labels, 4-way spatial focus navigation, safe-area overscan; no pointer-hover dependency.  
**Wearable:** 1 primary task per glance, high contrast, 48px+ primary interactions if available; use native crown/rotary affordance and platform-safe areas. Avoid complex Lens blur.  
**Spatial:** use system-defined native depth/materials for windows; GC UI supplies semantic theme/content/component hierarchy; maintain real-world legibility, respect comfort field and depth separation; no unsupported environmental brightness assumptions.

## 5. Input-specific components
Touch gestures are shortcuts, never exclusive. Fine pointer may enable hover tooltips and dense tables but keyboard remains fully supported. Stylus may reveal precision controls while preserving non-stylus equivalents. TV/remote focus is not hover; it needs visible directional movement, scale or stroke and deterministic back behavior. Screen reader navigation follows semantic document order regardless of CSS grid positions.

## 6. Overlay geometry
Popovers align to trigger and flip to avoid cutoffs. Dialog max 560px wide, central at desktop, near full-screen when 320px/400% zoom conditions require it. Bottom sheets stop above on-screen keyboard; keyboard and Escape close. Lens overlays reserve top/bottom scroll-padding so keyboard-focused content cannot hide behind the dock. On iOS/Android respect safe area insets.

## 7. Bidirectionality and localization
Layout uses logical inline/block properties. Navigation back/forward metaphors mirror in RTL, but media play/pause and brand assets do not unless localization rules demand it. Numbers/dates/currencies follow locale; default text labels never concatenate strings that translators must reorder. At pseudo-localized 40% expansion, controls must adapt rather than clip. Long German labels, Arabic connected scripts, CJK vertical metrics and right-to-left mixed numeric text are part of acceptance tests.

## 8. Orientation and scale
No experience should demand an orientation unless the task physically requires one. Test 320px width and 400% zoom without 2D scrolling for ordinary content; exceptions apply to legitimately complex data tables and diagrams when alternate accessible representations exist. At 200% OS text scale, allow controls and navigation to wrap, stack or promote to accessible overflow. Avoid fixed-height containers around dynamic text.

## 9. Responsive samples (pseudo-code)
- If container <600: list full width, details separate route, bottom nav.
- Else if <840: list plus toggleable detail, rail.
- Else if <1200: list/detail two-pane, rail.
- Else: persistent sidebar + list/detail with optional inspector.
Each mode must share one route state, one selection state and one focus restoration contract.

## 10. Performance and network resilience
Avoid heavy GPU effects on TV and low-powered phones. Pages remain usable while fonts/images load, on slow connections, and offline where cached content exists. Prefer native system controls for cross-platform text input and accessibility. Content hierarchy is visible without client JavaScript where product permits progressive enhancement.

## 11. Experimental adapter profiles
The [platform profile resolver](../src/gc-platform-profile.mjs) exposes design intent for responsive web, phone, tablet, desktop, TV, wearable and spatial platforms (target sizing, navigation, focus, material budget, motion). It does **not** claim actual iOS/Android/visionOS/TV operating system integration; native platform host code must implement safe areas, input, feedback and system materials. See [Experience Studio](EXPERIENCE_STUDIO.md).
