# GC UI — Stable release scope and acceptance policy

**Owner clarification:** 2026-10-17. **Applies to:** GoreeCloud/gc-ui design-system releases. **Priority:** This policy supersedes older roadmap/QA wording that describes the optional native research tracks below as *mandatory* stable-release blockers.

## Exclusive design authority and separate release maturity

GoreeCloud UI is the owner-designated **permanent successor** to the predecessor design system. The [succession record](DESIGN_SYSTEM_SUCCESSION.md) separates this target authority from still-pending Drive governance supersession, consumer migrations and predecessor retirement. This policy governs the **scoped GC UI artifact only**; passing its release gates does not prove ecosystem-wide cutover or automatically grant the established Seal/Anchor classification.

## What a stable GC UI design-system release means

A stable release is a deliberately **scoped, versioned, supported distribution** of the GC UI tokens, foundations, and components the project actually publishes. A canonical catalog of 63 *specified* patterns does **not** require all 63 to be implemented or stable simultaneously. Experimental labs, optional Android/Electron previews, unshipped platform adapters, and aspirational fidelity work are outside the stable package's scope unless the release expressly includes them.

The **stable-release decision** is based on the scope declared for that release:

1. **Public contract:** Identify the exported tokens, CSS, components, types and supported environments; document installation, usage, versioning, compatibility and migration/breaking-change policy. Do not present specification-only or experimental components as stable.
2. **Functional reliability:** Relevant automated tests and supported browser/integration checks pass for shipped functionality; deterministic token generation and public package manifests are validated; no known critical functionality regressions remain.
3. **Accessibility by implementation:** Shipped controls preserve semantic names, roles, values, keyboard operation, focus management, readable contrast, reflow, and reduced-motion/high-contrast/forced-colors safeguards under supported conditions. Verify with the applicable automated and targeted functional evidence. Accessibility remains an engineering requirement; *particular extra hardware or human screen-reader sessions* are not universally mandated for stable status.
4. **Security and provenance:** Applicable local-resource/IPC policies, dependency and license checks, build reproducibility, and release artifacts are validated. Publish only the packages or applications whose security and distribution paths were actually reviewed.
5. **Release decision:** Record supported scope, tested environments, known limitations, and owner approval; tag the supported version only after the scoped contract and packaging are ready.

## Optional validation — not universal stable-release blockers

The following are **optional / future confidence improvements**, not conditions that automatically prevent releasing the scoped GC UI design system:

- A **second physical Android device** or a larger low-end hardware laboratory.
- **Unplugged battery-energy measurements**, external watt/joule instrumentation, and full GPU/Perfetto energy characterization. Avoid efficiency claims that have not been measured.
- Additional **human desktop screen-reader listening sessions** (Orca, NVDA, VoiceOver), platform-wide assistive-technology matrices, or exact speech transcripts beyond the evidence chosen for the declared supported scope. A product that explicitly promises platform-specific assistive-technology coverage must validate that particular promise.
- Complete native SwiftUI/Compose/Windows/TV/spatial integrations or fully signed Android/desktop installers **when those are not part of the release deliverable**.
- Every pattern in the 63-component specification, all planned icon variants, wallpaper sampling, or every future third-party integration.

These activities may remain tracked as research, optional QA, platform-specific readiness or future product milestones. A failed or unavailable **optional** device/power/AT study must not automatically flip the design-system stable readiness decision to BLOCKED.

## Claims that still need evidence

- Do not claim **WCAG certification**, universal VoiceOver/NVDA/Orca compatibility, measurable battery savings, full-GPU energy performance, or OS app-store approval without evidence supporting each claim.
- Actual accessibility or security defects in shipped supported components **remain defects** and can block those components; removing a universal *test requirement* never licenses broken keyboard, unsafe resources, unreadable text, or misrepresented functionality.
- **Signed native artifacts** and platform distribution checks become release-specific requirements if and when a native installer or store package is actually shipped.

## Staged package checkpoint (2026-10-17)

[Foundations 1.0.0-rc.1](FOUNDATIONS_RELEASE_CANDIDATE_2026_10_17.md) is an offline-installable **private candidate** with a deliberately narrow API, types and tested artifact. The root package remains private alpha. The candidate still requires owner decisions on license, package identity and final publication; none of the optional device/energy/desktop human QA became mandatory.

## Current status is not retroactively promoted

The source currently identifies itself as `0.2.0-alpha.1`, with a private package and experimental component references. Correcting the policy does **not** change the version, make all 63 patterns stable, publish a package, or grant production certification. The next stable milestone should be driven by the **actual exported package and scoped acceptance**, not the optional hardware studies.

## Evidence preservation

Earlier dated QA reports accurately state what was run, what could not be measured, and when physical/speech verification was unavailable. Those facts stand. References in those reports to a "blocked release" are **historical planning labels superseded by this owner-approved release-scope policy**. The 12/12 user-reported Android TalkBack acceptance remains complete and unchanged.
