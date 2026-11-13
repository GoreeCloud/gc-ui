# Unified design language — review and acceptance matrix

**Status:** Review artifact for draft PR #75; not an approved standard, token migration, accessibility certification, or deployment.

| Decision | Verified existing behavior | Proposed interpretation | Acceptance evidence |
| --- | --- | --- | --- |
| Color freedom | `docs/DESIGN_LANGUAGE.md` disallows mandatory global/default/system/brand hue; Iris/Lagoon/Ember/Moss are optional | Navy/electric-blue as opt-in signature presentation, not universal palette | Founder confirms optional-vs-required scope; explicit app palette selection retained |
| Glass vocabulary | Cloud Canvas / Surface / Lens, with solid fallback | Base/Elevated/Overlay/Solid are usage roles, not immediate token renames | Crosswalk approved; components preserve semantic roles and opaque fallback |
| Motion | 120/220/380ms fast/base/slow | 150–250ms typical interaction *guidance*; base 220ms already fits | Reduced-motion tests; no unjustified global duration change |
| Contrast | Opaque-pair checks cover 82 cases, not composited Lens | Test variable-backdrop glass in light/dark, contrast-more, forced-colors and reduced-transparency | Screenshots and measurable foreground/nontext contrast across representative backgrounds |
| Platform | Browser tokens and native exports are generated from JSON; native behavior needs validation | Native effects only where supported, solid fallback elsewhere | Deterministic token generation, browser/native checks, device review |
| Privacy/security | GoreeShield privacy, Wardveil cybersecurity, Identity authorization, Mesh integration | UI communicates verified state but never substitutes for enforcement | Component tests show pending/error/denied/offline states without false success claims |

## Execution sequence

1. **Decision gate:** Founder reviews hue policy and the proposed glass-role crosswalk. No mandatory color change without explicit governance reconciliation.
2. **Token gate:** If approved, add only reviewed semantic tokens to `tokens/gc.tokens.json`, regenerate derived resources, run existing token/contrast checks and review diffs.
3. **Component gate:** Exercise buttons, navigation, dialogs, menus and forms across states, themes, transparency preferences and keyboard paths.
4. **Device gate:** Validate visual quality, screen-reader behavior, responsive layouts, touch, reduced motion, forced colors and variable-backdrop contrast on representative devices.
5. **Promotion gate:** Require successful CI, explicit design acceptance, migration notes and consumer compatibility evidence before merging normative implementation or claiming conformance.

## Non-goals and safeguards

No hardcoded global blue, speculative brand hex values, wholesale Cloud layer renaming, unsafe CSS backdrop effects, proprietary font redistribution, or production changes are authorized by this review artifact. Record observed failures and remaining gaps rather than inferring certification from unit tests.
