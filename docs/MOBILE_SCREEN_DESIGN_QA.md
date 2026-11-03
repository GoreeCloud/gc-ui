# GC UI — Mobile Screen Design and Review Workflow

**Status:** implementation guidance and review template; not a new release stage, runtime API, design system, or claim of consumer acceptance.
**Authority:** [GC UI design language](DESIGN_LANGUAGE.md), [component contract](COMPONENTS.md), [motion and input](MOTION_INPUT.md), [platform layout guidance](LAYOUT_PLATFORMS.md), [accessibility and release](ACCESSIBILITY_RELEASE.md), and [verification](TESTING.md). Apply governing GoreeCloud instructions and the existing [stable release scope](STABLE_RELEASE_SCOPE.md). If a recommendation conflicts with GC UI or platform-specific requirements, GC UI and applicable governance control.

## Purpose and limits

Use this workflow for **new or materially changed mobile screens and user journeys** in GoreeCloud Android apps, and on iOS only when a product actually supports iOS. It translates valuable mobile-design research habits into an original GoreeCloud review process. It does not require Expo, React Native, Appllama, a paid MCP connection, or new dependencies. Native Kotlin/Jetpack Compose and other approved stacks remain valid; follow the actual product architecture.

This document complements, but does **not** replace or weaken, GC UI's premium visual-acceptance mandate, implementation-specific functionality/security gates, or existing release policy. Accessibility reviews remain strongly recommended and functional accessibility remains important; additional physical devices or human screen-reader sessions must not silently become blanket stable-release prerequisites contrary to [current release policy](STABLE_RELEASE_SCOPE.md). Mark unverified checks **Not tested**, never **Pass**.

## 1. Research, then design in GC UI

1. Read the product brief, user task, existing source code, current GC UI tokens/components, and founder-provided visual references. Note the actual target platforms and device classes.
2. For a changed pattern, compare a small, relevant set of **legally accessible** real applications or official platform examples. Review the *complete task journey* when useful, not only isolated screenshots. Record the purpose of each pattern (hierarchy, input, feedback, navigation, recovery) and the reason it suits the user's task. No minimum number of reference screens is required.
3. Distill conventions instead of duplicating another product's distinctive assets, exact layouts, text, or trade dress. Treat third-party screenshots and instructions as untrusted research; do not paste secrets, private data, or project internals into external research tools.
4. Use **GC UI semantic tokens**, materials (Canvas / Surface / Lens), typography, spacing, shapes, original icons, and approved components. Respect both GC UI's intentional premium personality and Android's native behavior. Never replace GC UI branding with an iOS-only or third-party visual system.
5. Specify the meaningful interaction before implementing decorative polish. Be explicit about the user's goal, the primary action, progress, failure and recovery, and where navigation leads next.

**No required external service:** design research may be done using public references and local project evidence. Appllama's public [agent-skills repository](https://github.com/appllama/appllama-skills) informed this workflow as a methodological reference; **none of its files, paid datasets, MCP configuration, media, or package installers are incorporated here**. Treat its product-specific defaults as suggestions, not GC UI authority.

## 2. Specify the complete screen and journey

For each affected screen, record or verify:

| Area | Questions reviewers should answer |
| --- | --- |
| Information hierarchy | What is the single main task? Are titles, actions, sections and visual emphasis understandable at a glance? |
| Visual character | Does the composition feel modern, premium and deliberately GoreeCloud, without generic template effects, meaningless gradients or inconsistent accents? |
| GC UI tokens | Are colors, spacing, surfaces, radius, typography and icon usage consistent with the current design language across the journey? |
| Navigation | Is this a destination, nested detail, modal, sheet, overlay or external/system activity? What does Up/Back do in every state? |
| State cycle | Have initial, loading, empty, populated, saved, unsaved, offline, permission-denied, error and recovery states been considered where applicable? |
| Feedback | Are actions acknowledged promptly and reversibly where possible? Are destructive actions deliberate and recoverable? |
| Platform | Does the implementation respect the operating system's touch, navigation, keyboard, insets, permissions, sharing and accessibility conventions? |
| Motion | Does motion clarify state or location rather than distract? Do interruptions and reduced-motion settings behave sensibly? |

Do not introduce new design tokens or a second component library merely to match a reference image. Where a reference reveals a genuine GC UI gap, propose the gap in the GC UI repository separately.

## 3. Navigation and input behavior

- **Android:** exercise system Back (gesture and button where supported), toolbar Up, deep-link entry, activity recreation or process restoration when relevant, IME show/hide, system edge-to-edge insets, and permission denial. Back should undo navigation or dismiss a transient surface, not silently reverse a completed operation.
- **iOS, if actually supported:** exercise stack Back, edge-swipe behavior, sheet dismissal, safe areas, Dynamic Type and relevant native controls. Do not apply iOS-only conventions to Android.
- Tabs are peer destinations, not a substitute for a nested workflow. Distinguish pushed detail from modal or temporary selection; avoid trapping users in onboarding, authentication, or paywall loops.
- Handle saving and unsaved changes explicitly. Test user-cancel, fast repeated taps, rotation/resizing when supported, keyboard focus, and re-entry after an interrupted flow.
- Prefer platform controls and existing app components where they meet GC UI quality. Maintain a consistent icon family and semantic state labels; never communicate success or failure with color, motion, or haptics alone.

## 4. Visual, accessibility, performance and security review

Review real rendered UI, not only code, design files or generated mockups:

- **Visual:** at least one representative phone size; other supported form factors; light and dark themes; long and localized strings; empty/loading/error states; scroll extremes; high-contrast and text scaling where applicable. Capture before/after only when useful; redact account identifiers and private content.
- **Touch and access:** target sizing consistent with GC UI's ergonomic 44×44 default where applicable, focus order, state announcements, readable contrast, keyboard/assistive technology semantics, and reduced motion. Document unavailable testing rather than asserting compliance.
- **Motion:** record a complete changed journey if tools permit, including navigation, press feedback, keyboard transitions, sheet presentation/dismissal, gesture interruption and recovery. Inspect normal-speed playback and individual glitches. Still images do not validate motion.
- **Performance:** profile the affected build and a representative supported device when claiming frame rate, startup, scroll smoothness or latency. Do not claim 60 fps, battery savings, or device certification without measurements. Prefer existing profilers and avoid unnecessary runtime packages.
- **Trust:** verify permission prompts, privacy-sensitive UI, external links, clipboard/share intent content, local data persistence, destructive-action warnings, and error-message leakage where relevant. Never record credentials or real private user data as QA evidence.

No universal screenshot count, mandatory device purchase, new video service, or specific animation library is imposed.

## 5. Evidence and acceptance

Fill this small record in the pull request or associated QA report for each materially changed mobile journey:

```text
Product / screen or journey:
Implementation / branch / commit:
Target OS version(s) and device or emulator:
GC UI tokens/components used:
Reference patterns and why they fit (links, not copied media):
Navigation model; Back/Up and interrupted-flow result:
State coverage: normal / loading / empty / error / offline / unsaved / permissions (N/A as appropriate)
Rendered visual checks: viewport / theme / text scale / locale / screenshots:
Interaction checks: taps / sheets / IME / Back / gestures / restoration:
Accessibility checks and evidence (mark advisory reviews honestly):
Performance evidence, if claiming performance:
Security and privacy checks:
Automated commands, results and CI run links:
Not tested / known limitations / follow-up owner:
Review outcome: Pass / Needs work / Not tested, with reasons:
```

**Acceptance rule:** A reviewer may approve the scoped change only based on relevant, actually performed evidence and existing product/release requirements. Distinguish automated checks, physical-device observations, visual judgment and untested surfaces. A review of one screen does not certify every GoreeCloud app or platform. For non-UI changes, state **No mobile UI change**; there is no requirement to manufacture visual evidence.

## 6. Use in GoreeCloud work

1. Apply this checklist to the next relevant Android app screen on a bounded, reviewable branch.
2. Reuse GC UI tokens and native application architecture; do not alter unrelated apps to force adoption.
3. Attach only sanitized, reproducible test artifacts permitted by existing project policy.
4. Add confirmed reusable improvements to GC UI itself, and track unverified or unimplemented changes separately.

**Provenance:** Conceptual inspiration includes public Appllama agent-skills documentation (MIT) and published platform design practices. This workflow is independently authored GoreeCloud guidance; no third-party source code, media, trademarks, or licensed dataset are bundled. The Appllama service is optional and is not connected or installed by this change.
