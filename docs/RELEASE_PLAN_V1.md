# GC UI — Release and Verification Roadmap

GC UI has a **complete candidate design-language specification** and an **experimental browser implementation**. These are intentionally different maturity tracks: describing a component contract does not make that component available in a production package.

## Version and approval model
- **0.1 Foundation Alpha:** existing independent GC UI workspace playground, early semantic tokens.
- **v1 Candidate Specification:** docs covering identity, foundation tokens, full component catalog, color, typography, icons, motion, layout, multimodal input, accessibility and APIs.
- **Experimental v1 Web Reference:** `lab/v1.html`, `lab/components.html`, custom color engine, theme runtime, CSS primitives and interaction bindings.
- **Stable Design System v1.0:** **not yet released**. Requires implementation and validation across target platforms, semantic-versioned distributables and application-level audits.

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
Create role alias validation and a truly semantic token compiler that exports CSS, Swift/Compose resources and visual swatches from the same reference values. Ensure dynamic themes do not assign arbitrary seeds to error/warning/status roles. Add palette approval fixtures. Release gate: all defined role pairs and high-contrast overrides tested in real browsers.

### B — Component package (priority 1)
Convert reference CSS and behaviors into a stable semantic web API. Implement 15–20 core components first: Button, IconButton, Field, Checkbox, Radio, Switch, Slider, Select, Tabs, Menu, Popover, Dialog, Sheet, Toast, Banner, Card, List, Navigation, Progress, and Tooltip. Include anatomy, focus contracts, responsive behavior, error/loading states, RTL and Storybook-equivalent examples. Release gate: integration tests + manual AT verification, immutable documented props, changelog.

### C — Iconography and motion (priority 2)
Create unique GC UI solid variants for every outline glyph, plus exported size fixtures and optical alignment checks at 16/20/24/32. Build state transition samples and guardrails for reduced motion. Release gate: visual inspection in light/dark/high contrast at 100%/200% zoom.

### D — Platform adapters and large-screen UI (priority 2)
Implement native themes for iOS/macOS, Android, Windows and 10-foot TV layouts without pretending to recreate proprietary material rendering. Validate foldable safe segments, remote four-way focus, pointer/keyboard, and accessibility bridge. Release gate: real-device screenshots, assistive-tech review, gesture/remote tests.

## Exit criteria for a stable release
1. Test matrix: Chrome/Firefox/Safari current supported engines, Windows/macOS/iOS/Android, compact through ultrawide and high-density screens.
2. All public tokens documented and versioned; generated code drift blocked by CI.
3. Semantic foreground/background and translucent-composite contrast verified; high contrast, forced colors, reduced motion/transparency tested.
4. Keyboard, focus placement/recovery, touch hit area, screen readers, browser zoom and dynamic font scaling manually tested on critical workflows.
5. A released consumable library with an installation path, module exports, types/semantics, usage examples, migration notes and versioning policy.
6. Nonblocking motion, verified visual regression snapshots and performance testing on lower-powered hardware.
7. QA signoff on every component; publish only the variants with valid accessibility and responsive contracts.

## Working rules
- No Glaze UI code or design tokens imported into GC UI.
- No changes to repositories other than `GoreeCloud/gc-ui`.
- No direct copying of Apple or Google proprietary assets. Concepts are inspirations; GC UI retains its own implementation.
- Experiments live in the labs and do not silently become public stable API.
- Do not declare production readiness from code coverage alone.
