# Unified GoreeCloud UI — reproducible validation plan

**Status:** Non-normative test plan for draft PR #75. No tests are claimed to have run by virtue of this document. Run in a disposable, authorized checkout with reviewed dependencies and no production secrets.

## Baseline checks

From the `GoreeCloud/gc-ui` repository root, with a supported Node.js runtime (package engine: Node >=20) and a trusted, dependency-reviewed installation:

```sh
node --version
npm run icons:check
npm run tokens:check
npm run export:check
npm run contrast:check
npm test
```

The `npm run check` aggregate additionally invokes `npm run export:platform`, which writes generated resources. Therefore **do not** call it a read-only validation command. Execute it only in a disposable worktree, review the generated diff and never commit generated changes blindly. A successful opaque-pair contrast audit does not validate translucent compositor backdrops.

## Review matrix

| Case | Setup | Required observation |
| --- | --- | --- |
| Theme independence | Light/dark/auto with each optional accent and app-defined custom accent | No forced global blue; legible semantic foregrounds and controls |
| Material crosswalk | Canvas, Surface, Lens with Base/Elevated/Overlay usage patterns | Readability and consistent hierarchy; no breaking rename |
| Variable glass backdrops | Light/dark content over flat, gradient and high-detail backgrounds | Pass computed-color worst-case RGB compositing guard for opaque text on simple translucent fills; separately measure real *composited screenshot pixels*, high-detail images and layered treatments; switch to solid fallback when needed |
| Reduced transparency | OS/browser transparency-reduction preference or documented override; toggle the live lab `#transparency` control plus four-material fixture without an OS preference; test native `.gc-lens`, `.gc-bottom-nav` and dialog scrims | Opaque blur-free Lens toolbar plus both viewport/window-owned docks; More Contrast independently disables blur; original theme restored without losing focus/state, no local storage/cookie writes; combined preferences preserve forced-colors palette |
| Forced colors / increased contrast | Platform high-contrast mode | Focus, status, boundaries and dialogs remain perceivable |
| Reduced motion | OS/browser reduced-motion preference | Essential state remains clear without animated transitions |
| Keyboard | Tab/Shift+Tab, arrows where appropriate, Enter/Space, Escape | Visible focus, correct order, no traps, focus return |
| Screen reader | Representative mobile and desktop readers | Labels, states, errors and live updates announced accurately |
| Touch / responsive | Narrow phone, tablet, desktop, large text/zoom, RTL | Safe-area-aware navigation, reflow, reachable targets, no clipped content |
| Async and error states | Loading, offline, permission denied, failure and recovery | No false success, no color-only state, no sensitive content leak |
| Performance | Low-power device, overlapping glass and long scroll | No persistent expensive blur, excessive layout thrash or animation loops |
| Native adaptation | Each implemented native target separately | Verified system-material behavior or opaque fallback; no assumption that browser CSS proves native support |

## Evidence record for each test

Record date, exact commit, runtime, OS/browser/device, viewport and scaling, theme, accent, contrast/transparency/motion preferences, steps, expected/actual result, screenshots only if privacy-safe, and issue/PR links. Mark each case **pass**, **fail**, **blocked**, or **not run**. Never convert unexecuted checks into a green status.

## Release gates

1. Founder resolves the optional-signature-blue versus mandatory-hue question.
2. All normative token or component changes have documented migration/rollback and deterministic generated-asset diffs.
3. Automated checks pass in a clean disposable checkout; failures are triaged.
4. Representative human/device accessibility and glass-compositing reviews pass.
5. CI, code review and consumer compatibility evidence precede promotion or stable-release claims.

**Ownership boundaries:** GoreeCloud UI renders interaction; Identity enforces access; GoreeShield governs privacy; Wardveil governs cybersecurity; Mesh handles interoperability. Tests of UI messaging do not prove backend enforcement.
