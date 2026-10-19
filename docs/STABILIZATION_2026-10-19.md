# GoreeCloud UI stabilization — 2026-10-19

Scope: the GC UI source and tests in this repository only. The maintenance
baseline is `main` at `d569525b1213c729dfa19e3ca17fd4916b9c1a0d`.

## Findings and repairs

- Group choreography previously animated repeated element references multiple
  times while tracking only the last animation. A subsequent cancellation
  could leave an earlier animation running. The controller now skips repeated
  element references and can retire every animation it starts.
- Both group choreography and the individual motion coordinator treated a
  throwing Web Animations API as a fatal interaction error. Because GC UI
  motion is an optional progressive enhancement, they now preserve the final
  DOM state and gracefully omit motion if `element.animate()` fails.
- Invalid named presets remain explicit programming errors rather than being
  silently ignored.

## Verification

- The three new regression cases were confirmed failing against the previous
  motion implementation and passing after repair.
- `node --test tests/choreography.test.mjs tests/transition-coordinator.test.mjs`:
  12 passing tests.
- `npm run check`: completed successfully, including generated token
  consistency, migration evidence integrity, unit tests, contrast audits,
  local asset references, and npm package manifest checks.
- `npm run release:foundations:verify`: offline Foundations consumer-install
  verification passed.
- The latest pre-change `main` CI run was green. GitHub browser smoke tests
  remain the authoritative cross-browser evidence for the proposed changes.

## Release boundaries

The cutover-readiness ledger reports **0 of 18 consumers accepted** and
**four pending independent gates**. Passing source checks does not mean the
platform cutover is approved. No external consumer repository, publishing
credential, or deployment configuration was changed.

Follow-up: review the pull-request quality gates, particularly Chromium and
Firefox interaction/effective-zoom coverage, before merging to `main`.

## Same-day continuation — legacy-audit accuracy and transient contrast

- A read-only consumer audit that only encountered abbreviated `glz-`
  custom elements, CSS component classes, or asset filenames could previously
  claim `no-legacy-evidence-detected`. A malformed UTF-8 source file could
  also silently decode as replacement characters and receive a false-clean
  result. Both cases were reproduced before changes and receive fail-closed
  classifications after scanner hardening. Strict mode now returns 2 for
  active abbreviated legacy references, or 3 for malformed text.
- Chromium CI surfaced a transient dark-mode accessibility failure in the
  Foundations reference lab: the foreground snapped to light while a
  secondary button background was still transitioning from the light palette.
  A direct Playwright reproduction measured only about 1.07:1 contrast during
  the switch. The lab no longer animates the button background across theme
  changes, preserving atomic foreground/background contrast while retaining
  press feedback.
- The new immediate-contrast regression passed five repeated Chromium runs,
  and the full local axe scenario suite passed 22/22. Core source checks and
  auditor strict-exit regression tests also passed. Final hosted CI evidence
  remains required before accepting the follow-up change.

These repairs do not change any consumer migration, deployment, publication,
license decision, or governance/readiness assertion.
