# GC UI — Accessibility, Verification & Release Gates
**Target:** WCAG 2.2 AA for web experiences; preserve native platform accessibility APIs elsewhere. Not a certificate of current implementation. Design approval is not conformance testing.

## Current Android TalkBack manual checkpoint (2026-10-17)

The GC UI Android WebView Studio manual checklist **TB-01 through TB-12 is user-reported 12/12 PASS**. See the [reported manual acceptance](QA_TALKBACK_USER_ACCEPTANCE_2026_10_17.md). Individual spoken transcripts/session metadata are not stored in this report. This is progress on one Android implementation's assistive-technology matrix, not a global WCAG 2.2 AA conformance claim, Android device-family certification or completion of VoiceOver/Orca/NVDA acceptance.

## 1. Normative acceptance tests
| Domain | Requirement | Evidence |
|---|---|---|
| Text contrast | >=4.5:1 normal, >=3:1 large text (SC 1.4.3) | automated per semantic pair + screenshot compositing |
| Non-text contrast | >=3:1 for required component boundaries/indicators (SC 1.4.11) | state screenshots and calculations |
| Target size | >=24x24 CSS px or specified WCAG 2.2 exceptions (SC 2.5.8); GC UI default ergonomic >=44x44 | DOM geometry audit, touch lab |
| Keyboard | all interactions without path-specific pointer input | Tab + Enter/Space/Arrows/Escape walkthrough |
| Focus | visible, not obscured by docks/sheets; logical order | keyboard + WCAG 2.4.7 / 2.4.11 |
| Status messages | announced without focus theft (SC 4.1.3) | VoiceOver, NVDA, TalkBack |
| Labels | explicit accessible names, roles and values (SC 4.1.2) | accessibility tree inspection |
| Errors | identification, suggestion, prevention where necessary | validation and submit tests |
| Reflow | 320px CSS and 400% zoom for applicable content | responsive tests |
| Resize text | >=200% without loss of content/function | OS/Browser zoom tests |
| Motion | prefers-reduced-motion disables decorative motion | OS preference + tests |
| Transparency | prefers-reduced-transparency & forced-colors use opaque fallback | platform matrix |
| Color blindness | selected/status/error signified by text, shape or indicator | grayscale simulation + user tests |
| Time limits | extend/pause/dismiss transient required information | timed UX tests |

## 2. Focus rules
Focusable overlays show 2–3px ring with >=3:1 contrast against adjacent fills; use an offset to avoid eating the component silhouette. Programmatic focus moves for dialog open and proper return on close. Popover Escape restores focus to trigger; route navigation focuses destination heading in an SPA where appropriate. Dialog controls can't leak tab focus to background. No permanent footer/dock may obscure focused element.

## 3. Lens-specific failure modes
Blur does **not** guarantee contrast. Measure the actual RGB composite against a worst-case grid: saturated wallpaper, light photograph, black content, rapidly changing video, and text behind overlay. If any required pairing cannot be secured, choose solid Lens. Reduced transparency and increased contrast preferences override theme character. Forced-colors disables background filtering and decorative layers; native system focus and selection colors take precedence.

## 4. Color and state verification
Test every semantic pair and all combinations in the theme matrix (palette x appearance x contrast x material). Document contrast ratios in an artifact produced by CI. Avoid contrast checks on uncomposited RGBA. Inspect status text and icon signals independently. Error labels and all validation messages are readable to screen readers and persist until resolved.

## 5. Language and cognitive accessibility
Use short, specific labels; consistent navigation; predictable primary action position; expandable help; undo where possible. Don't time out complex forms by default. Persist partially entered data. Avoid meaningless shimmer animation and unexplained icon-only navigation. For nontrivial animations, user can stop or reduce effects. Provide error recovery that says **what happened, what it affects, and what to do next**.

## 6. Release stages
| Stage | Meaning | Minimum proof |
|---|---|---|
| experimental | concept or first prototype | design anatomy, known limitations |
| alpha | functional reference; APIs may change | unit tests, semantic markup, documented gaps |
| beta | integration-ready | broad keyboard/a11y automation, responsive matrix, theme contrast validation, versioned APIs |
| stable | production-supported | manual AT review on representative OS/browser pairs, regression suite, adoption reference, security/performance review, changelog and migration guide |

## 7. Required manual assistive-technology matrix
- VoiceOver + Safari on macOS/iOS; TalkBack + Chrome on Android; NVDA + Chrome/Firefox on Windows.
- Keyboard only, switch access where available, voice control naming, 200% and 400% zoom.
- Touch exploration, remote directional focus for TV, RTL and long-translation layout.
- Light/dark/high contrast/forced colors + reduced motion/transparency.
- Disabled JS/reduced network capabilities where progressive enhancement applies.

## 8. CI minimum
Unit: token schema and valid references, no missing role, no duplicate public names.  
Integration: keyboard navigation and route/focus tests with Playwright; axe-core for known automation coverage.  
Visual: per-theme/button state screenshots, compare DPR 1/2, 320/768/1280/1920 widths; forced colors snapshots.  
Contrast: background compositor computes real ratios; prevents a theme with failing pairs from publishing.  
Document any false positives/known exceptions; manual sign-off always required.

## 9. References
WCAG 2.2: https://www.w3.org/TR/WCAG22/  
Text contrast: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html  
Target size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum  
Focus not obscured: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum

## 10. Compliance statement rule
Do not label GC UI as "WCAG certified" or "AA compliant" on the strength of documentation or unit tests alone. Compliance claims are application- and context-specific and require documented audit evidence.
