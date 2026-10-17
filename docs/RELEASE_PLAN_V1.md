# GC UI — Release and Verification Roadmap

**Current owner-approved criteria:** [Stable Release Scope](STABLE_RELEASE_SCOPE.md). This supersedes earlier broad exit criteria that treated optional device/power/platform research as universal stable-release prerequisites.

GC UI has a **complete candidate design-language specification** and an **experimental browser implementation**. These are intentionally different maturity tracks: describing a component contract does not make that component available in a production package.

## Version and approval model
- **0.1 Foundation Alpha:** existing independent GC UI workspace playground, early semantic tokens.
- **v1 Candidate Specification:** docs covering identity, foundation tokens, full component catalog, color, typography, icons, motion, layout, multimodal input, accessibility and APIs.
- **Experimental v1 Web Reference:** `lab/v1.html`, `lab/components.html`, custom color engine, theme runtime, CSS primitives and interaction bindings.
- **Stable Design System v1.0:** **not yet released**. Requires a declared **supported package scope**, tested versioned exports, critical quality/accessibility/security guarantees for what ships, and owner approval. Unshipped native platforms and optional research are not prerequisites.

## Current evidence and gaps (October 16, 2026)
| Workstream | Available today | Evidence | Still required |
|---|---|---|---|
| Core design language | normative candidate specification | eight reference chapters | external critique, frozen vocabulary and approval |
| Semantic tokens | versioned JSON and generated CSS | generator/check test | full aliases, references, tool export, platform parity |
| Custom color | independent OKLCH engine, light/dark, primary/on roles | sampled 361 seeds / 722 schemes / 7,220 text contrast pairs | composite contrast, wallpaper consent/permissions, perceptual review and color-blind testing |
| Accessible theme | auto/manual appearance, curated/custom accents, material override, contrast | controller unit tests | screenreader/OS/browser validation, high-contrast palette hardening |
| Component specification | 63 patterns | catalog | per-component Figma/asset anatomy, systematic API implementations |
| Working web controls | buttons, fields, switch, tabs, native dialogs, feedback, Lens and async binding | unit tests + two labs | full browser E2E, manual keyboard and AT audits, consumer package |
| Glyphs | 12 original outline SVGs | structural tests and Components Lab | matching filled variants, small-size optical drawings, full library |
| Multi-platform | defined adaptive experiences | layout/input docs | native SwiftUI/Compose/Windows/TV/spatial packages, device tests |
| Quality | GitHub Actions lint-like syntax, unit/token/asset checks | CI workflow | browser automation, screenshot snapshots, accessibility tooling, performance profiling |

**Conformance note:** Passing color-pair and token unit tests is NOT WCAG certification, not an audit of translucent overlays, and not a guarantee that all content states remain readable.

## Parallel implementation streams
### A — Foundations and tokens (priority 1)
Create role alias validation and a truly semantic token compiler that exports CSS, Swift/Compose resources and visual swatches from the same reference values. Ensure dynamic themes do not assign arbitrary seeds to error/warning/status roles. Add palette approval fixtures. Acceptance for the included semantic role pairs: contrast and high-contrast overrides verified in supported browsers.

### B — Component package (priority 1)
Convert reference CSS and behaviors into a stable semantic web API. Implement 15–20 core components first: Button, IconButton, Field, Checkbox, Radio, Switch, Slider, Select, Tabs, Menu, Popover, Dialog, Sheet, Toast, Banner, Card, List, Navigation, Progress, and Tooltip. Include anatomy, focus contracts, responsive behavior, error/loading states, RTL and Storybook-equivalent examples. Scoped acceptance: automated interactions and relevant keyboard/semantic accessibility checks, documented props, and changelog. Extra human AT matrix coverage is optional unless explicitly promised for a supported platform.

### C — Iconography and motion (priority 2)
Create unique GC UI solid variants for every outline glyph, plus exported size fixtures and optical alignment checks at 16/20/24/32. Build state transition samples and guardrails for reduced motion. Quality target for shipped glyphs/motion: light/dark/high-contrast inspection at applicable zoom.

### D — Platform adapters and large-screen UI (priority 2)
Implement native themes for iOS/macOS, Android, Windows and 10-foot TV layouts without pretending to recreate proprietary material rendering. Validate foldable safe segments, remote four-way focus, pointer/keyboard, and accessibility bridge. Conditional native deliverable acceptance (if published): relevant device, focus/gesture, security and distribution checks. Unshipped platform adapters are not a design-system release gate.

## Exit criteria for a scoped stable design-system release

Stable v1.0 is assessed against **declared published scope**, not completion of every aspiration in the platform/component catalog. The authoritative [Stable Release Scope](STABLE_RELEASE_SCOPE.md) defines the decision.

1. **Versioned public package:** Publishable, tested exports, token contracts/types, release notes, installation and migration/compatibility guidance for the *actually shipped* tokens and components.
2. **Working supported API:** Unit/integration/interaction and applicable Chromium/Firefox/Safari checks for each supported shipped surface; package and generated-token integrity tests green; critical regressions resolved.
3. **Baseline accessibility and security:** Shipped semantic controls, keyboard/focus, contrast/composited materials, reflow, reduced-motion/high-contrast fallbacks, local-resource boundaries and applicable dependencies reviewed. Do not make unsupported WCAG or platform AT claims.
4. **Explicit release scope and approval:** Mark specification-only/experimental patterns accordingly; document supported platforms, caveats and owner signoff before version tagging.
5. **Conditional distribution tests:** Validate native package signing, platform-specific app-store requirements or other external deliverables **only when they are included in the release**.

**Not required by default:** a second physical Android device, disconnected-power watt/joule tests, full GPU-energy profiling, extra human Orca/NVDA/VoiceOver listening sessions, all 63 catalog patterns, and unshipped native integrations. These remain optional research/quality milestones, not automatic blockers to a stable design-system release. Their findings cannot be inflated into unsupported performance/accessibility claims.

The current private `0.2.0-alpha.1` preview is not automatically stable merely because release requirements have been clarified.

## Working rules
- No Glaze UI code or design tokens imported into GC UI.
- No changes to repositories other than `GoreeCloud/gc-ui`.
- No direct copying of Apple or Google proprietary assets. Concepts are inspirations; GC UI retains its own implementation.
- Experiments live in the labs and do not silently become public stable API.
- Do not declare production readiness from code coverage alone.
