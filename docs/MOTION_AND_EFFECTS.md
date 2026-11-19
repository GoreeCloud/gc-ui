# GoreeCloud UI — motion, transitions and intentional effects

**Authority:** GoreeCloud UI design language and the founder's November 17, 2026
direction for elegant, immersive, responsive digital experiences. **Status:**
alpha web implementation, not a universal consumer-acceptance claim.

## Product-wide experience requirement

GoreeCloud apps, websites, dashboards and interactive digital products must
deliver a refined, coherent experience in their supported context. Motion,
semantic color, responsive transition feedback, and visual depth are required
design disciplines, **not an instruction to animate everything**. The user
must understand what changed, why it changed and what action is available.
A productive interface may be mostly still; an attention-grabbing but
confusing interface fails this standard.

1. **Motion for comprehension.** Reveal a newly opened workspace, confirm a
   selected destination, communicate loading and completion, and preserve
   spatial continuity. Never delay access to essential content to stage a
   decorative intro. Do not run ornamental infinite loops or animation on
   every scroll, hover and card.
2. **Seamless state changes.** Use the existing `--gc-motion-fast`,
   `--gc-motion-base`, `--gc-motion-slow`, `--gc-ease` and
   `--gc-ease-expressive` tokens. Animate inexpensive `transform` and
   `opacity` where possible. Avoid `transition:all`, layout thrashing,
   forced reflows, excessive blur and always-running animations.
3. **Meaningful color coding.** Use existing `--gc-brand` for selection or
   app identity; `--gc-positive` for verified success, `--gc-warning` for
   caution, `--gc-negative` for error. Include explicit visible text or an
   accessible label, not color alone. Do not reclassify informational states as
   success or make every product use one global hue.
4. **Refined effects.** Use Cloud Canvas, Surface and Lens, optical borders,
   selective shadows, and subtle accent fields to clarify depth. Protect
   reading surfaces and avoid overlaid decoration on essential content.
5. **Device-respectful behavior.** Honor `prefers-reduced-motion`,
   `prefers-reduced-transparency`, increased contrast, forced colors,
   keyboard focus and pointer/touch differences. Reduced-motion content
   must be visible immediately and every control must still work.
6. **Controlled rollout.** Reuse approved assets and token roles, preserve
   functional navigation, state, security and accessibility, and perform
   sanitized screenshot / interaction reviews per app at real mobile, tablet
   and desktop sizes before calling the experience visually accepted.

## Opt-in web patterns

Import `@goreecloud/ui/tokens.css`, then
`@goreecloud/ui/components.css`. Use the CSS classes below within a real
`gc-app` root. These patterns intentionally require no JS, tracking,
storage, external images, or invented brand palette.

| Pattern | Intended usage | Behavior |
| --- | --- | --- |
| `gc-motion-enter` | A newly mounted panel or view | One short rise-and-fade entrance, never looping |
| `gc-motion-enter gc-motion-enter--quiet` | Subtle new response/status | Short fade with no translation |
| `gc-motion-interactive` | Real native button or link | Small hover lift and pressed feedback for eligible pointers; focus outline remains native and visible |
| `gc-motion-feedback` | Status/control surface whose semantic CSS classes change | Smooth background/border/text color changes; no opacity-based hiding |
| `gc-context-band[data-gc-tone]` | Labeled status context in a scene | Brand (unset), positive, warning or negative marker; foreground remains readable |

Minimal example (actions and data are supplied by the application):

```html
<main class="gc-scene__content">
  <section class="gc-context-band gc-motion-feedback"
           data-gc-tone="positive" role="status">
    <strong>Saved</strong><span>Your changes are stored.</span>
  </section>
  <div class="gc-motion-enter">
    <h2>Workspace</h2><p>Available immediately, without a blocking intro.</p>
  </div>
  <a href="/settings" class="gc-button gc-motion-interactive">Settings</a>
</main>
```

Apply `gc-motion-enter` only when mounting genuinely new content. Hiding and
remounting complete pages on every route, or applying this class to a
permanently present sidebar, will feel repetitive. Consumers must handle
routing, asynchronous loading, focus return, announcements, error states and
any view-transition API separately; CSS alone does not implement navigation.

## Verification criteria

- Navigate by pointer, keyboard and touch; test actual task completion,
  disabled states, focus visibility and no unexpected layout shifts.
- Verify light/dark/auto, each intended app accent, custom accents, and
  readable semantic status combinations (not status color alone).
- Verify reduced-motion yields no entrance movement, reduced-transparency
  does not obscure text, forced colors retain focus and distinguish status.
- Check 320px mobile, 390px phone, tablet and desktop widths; 200–400% zoom;
  representative low-power devices and animation smoothness without excessive
  CPU/GPU usage.
- Capture exact-source screenshot and interaction evidence, with before/after
  full-screen comparisons. A Node source test or headless rendering alone is
  not human visual acceptance or a native-platform implementation.

**Release boundary:** These are opt-in alpha CSS effects. No existing
GoreeCloud app is automatically restyled, and native Flutter/Qt Quick/Slint/
Compose implementations require separately reviewed adapters and real-device
testing.
