# GoreeCloud UI — Accessibility review

This is a checklist, **not an accessibility certificate**.

- Use semantic native controls and real associated labels. Name all icon-only buttons.
- Review Tab and Shift+Tab, focus visible, RTL-aware tab arrows, Home/End, native dialog Escape and focus return.
- Verify screen reader names, roles, states, ordering and live-region behavior on supported browser/OS combinations.
- Test narrow 320px, 200%/400% zoom, long text, larger font settings, RTL and device orientation.
- Use WCAG 2.2 AA contrast guidance of 4.5:1 ordinary text and 3:1 large text / essential nontext indicators (with exceptions); inspect overlays and transparent backgrounds in actual rendered states.
- Support forced colors, prefers-contrast, prefers-reduced-motion and prefers-reduced-transparency.
- Do not use color, motion, glass, icons or transient toasts as the only bearer of essential meaning.
- Include working loading, empty, unauthorized, offline, failure and recovery views in real consumers.
- Never announce network success before the actual operation is confirmed.
- Report tested platform/browser combinations, manual assistive-tech gaps and visual limitations separately.

Under founder governance, accessibility findings alone are advisory to the internal hobby-project Stable/Anchor designation. This does not waive legal, system-enforced, safety, privacy or platform requirements and does not permit false conformance claims.
