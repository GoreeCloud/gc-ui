# GC UI — Motion, State & Interaction Protocol
## 1. Motion principle
Motion must explain **what moved, why it moved, and where it belongs**. Prefer spatial continuity of one interactive object over multiple uncoordinated animations. Avoid interrupting task completion or moving focus unexpectedly. Simulated glass deformation is optional, never required.

## 2. Motion tokens
| Name | Duration | Easing | Usage |
|---|---:|---|---|
| immediate | 0–80ms | linear | pressed visual confirmation, light pulse |
| fast | 120ms | cubic-bezier(.2,.8,.2,1) | hover, focus chrome, selection highlight |
| standard | 220ms | cubic-bezier(.2,.8,.2,1) | toggle, menu, small disclosure |
| entrance | 320ms | cubic-bezier(.16,1,.3,1) | dialog/sheet appearance |
| expansive | 440ms | cubic-bezier(.16,1,.3,1) | layout reflow, large shared-element transition |
| exit | 160ms | cubic-bezier(.4,0,1,1) | dismissal |
Duration is a GC UI default: may be shortened for remote-driven TV navigation and low-powered hardware. No animation delays first useful paint. Stagger at most 30–45ms between 3 visible child groups, not hundreds of list items.

## 3. Spring recommendations
Use platform-native spring in gestures where native integration is available; canonical feel uses damping ratio ~0.82–1.0, no overshoot for destructive dialogs/forms, <=8% overshoot only for playful nonessential selection feedback. Avoid encoding springs in CSS as unrelated bounce keyframes. When measured with a physics engine, terminate to target at <=1px displacement and <=0.05px/ms velocity. Motion duration scales with travel up to 440ms; users remain in control.

## 4. Spatial continuity
- Button -> menu: origin anchored within 8px of trigger; do not pop from page center.
- List -> detail: continuity of thumbnail/title only when both views exist; focus moves to detail heading after navigation.
- Rail -> drawer: same destination labels and ordering, not two independent navigation models.
- Sheet -> full-screen: can adapt based on available viewport without visually teleporting active content.
- Drag: grabbed object's elevation increases from E1 to E3; destination outline appears; alternative keyboard reordering required.
- Gesture thresholds are input-specific; never bind destructive actions to an undocumented swipe alone.

## 5. Motion by state
| Event | Visual | Duration | User feedback |
|---|---|---:|---|
| hover | tonal tint or edge | 120ms | pointer only |
| focus-visible | immediate 2–3px outer ring | 0ms | keyboard focus unmistakable |
| pressed | 1–2% compression or tinted overlay | <=80ms | no layout reflow |
| select | indicator travel and fill | 220ms | accessible selected state |
| switch | thumb translation + track | 220ms | announce on/off via native state |
| accordion | panel reveal without text opacity fading | 220ms | aria-expanded |
| dialog open | opacity + small 6px translation | 320ms | focus moves inside |
| dialog close | opacity/translate reverse | 160ms | focus returns |
| error | no shake by default; border + helper | 120ms | error message announced |
| success | icon reveal / status text | 220ms | noninterruptive status announcement |
| progress | continuous only if appropriate | calm | numerical value when known |

## 6. Input and modality
**Touch:** hit >=44px ergonomic baseline, visible press response, no hover-only discovery, gestures accompanied by buttons.  
**Mouse:** pointer states, precision controls, context menus; never shrink targets below WCAG support.  
**Trackpad:** smooth wheel/scroll, pinch only when appropriate, native OS scrolling; do not hijack page scroll.  
**Keyboard:** all actions operable; logical Tab; conventional Enter/Space/Arrow/Escape/Home/End; visible focus.  
**Stylus:** precise hit affordances, optional hover/pressure, palm rejection delegated to platform; an alternative always exists.  
**Remote:** prominent focus halos, fast focus translation, four-way navigation, Back predictable, large cards with short labels.  
**Switch/voice input:** stable accessible names; avoid duplicate generic "more" controls; focus order follows DOM.  
**Spatial gaze/pinch:** apply host platform affordances; no arbitrary distance thresholds; explicit dwell for destructive actions.

## 7. Accessibility and interruption
Under prefers-reduced-motion: reduce, disable parallax, morph, animated background, autoplay transitions, bounce, and smooth scrolling; preserve instantaneous feedback. Under prefers-reduced-transparency: reduce or forced-colors, switch Lens to solid without changing the interaction model. Avoid flashing >3 times/second; a strong design simply avoids flashing. Do not animate foreground contrast through unreadable intermediate states. Animation cancellation must leave the component in a valid final state.

## 8. Haptics and sound
Feedback is semantic (selection, warning, confirmation), opt-in according to platform and user settings. Do not use sound or haptics as the sole message. Hardware APIs are platform-specific; web must not assume permission. Error feedback should be subtle, not punitive. Repeated events are rate-limited.

## 9. Measurements
Record start latency (target <50ms for local state reaction), movement smoothness, reduced-motion parity, focus stability, task completion while moving, and frame drops on representative low/mid devices. Failing comfort beats hitting an arbitrary 60fps number. Performance targets are product-specific and require profiling.

## 10. Optional third-party motion engines
GC UI's default motion presets use the native Web Animations API and preserve reduced-motion semantics. The optional [Motion, FormKit AutoAnimate and Lottie Web adapters](../integrations/optional-motion.mjs) are **not** automatic dependencies. Motion data/art, including downloaded Lottie files, must be reviewed for licensing, flashing, motion reduction and network use independently. See [third-party asset policy](THIRD_PARTY_ASSETS.md). These adapters are experimental, not a stable platform binding.

## 11. Managed transition lifecycle (experimental)
The experimental motion vocabulary also offers `surfaceEnter` (260ms), `surfaceExit`
(160ms), `press` (180ms), and RTL-aware `nudgeInline` (180ms).
They use native Web Animations, preserve real DOM state on cancellation, and
are suppressed by reduced-motion, forced-colors, or high-contrast preferences.
No external runtime or automatically animated component is introduced.

The new [motion coordinator](../src/gc-transition-coordinator.mjs) cancels an earlier animation on the same element before starting the next preset, removes completed fill layers, exposes cancel/cancelAll and destroy, and skips playback when WAAPI or user/system motion permission is absent. This prevents stale transitions from surviving route or state changes. The [interactive Motion Gallery](../lab/motion-gallery.html) demonstrates cancellation, RTL inline movement, and a reduced-motion preview.

## 12. Staggered choreography (experimental)
The [choreography controller](../src/gc-choreography.mjs) animates at most **three** visible DOM groups with a 0–45ms bounded stagger, cancels replaced sequences, and skips all visual motion under reduced-motion, forced-colors or high-contrast preferences. The DOM and focus remain authoritative; no timing gates block the task. Unlike the per-element coordinator, this is designed for a bounded group of related changes, not large item lists.
