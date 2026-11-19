# GoreeCloud UI — Badge and indicator contract

**Status:** web-alpha presentational guidance and CSS primitives; not an achievement, identity, trust-verification or notification backend. The controlling founder direction is `GoreeCloud/Standards/GoreeCloud-Badge-System.md` in the authorized GoreeCloud Drive. This repository implements the shared **presentation** side only.

## Choose a badge by meaning

| Family | Use | Required source or boundary |
| --- | --- | --- |
| Status | Availability, warnings, workflow progress | Display a truthful current or explicitly stale state in words |
| Count / notification | Unread or pending quantities | Define scope, timeframe and overflow behavior in the owning app |
| Icon | Identify a feature or adjacent item | Decorative icons have `aria-hidden="true"`; keep readable text |
| Achievement / recognition | A documented accomplishment or collection | An authorized issuer and revocable award record are product-owned |
| Profile | A user-selected or earned distinction | GoreeShield privacy controls determine visibility |
| Membership / role | Affiliation or user-assigned role | GoreeCloud Identity enforces permissions, not the CSS label |
| Verification / trust | Verified credentials or provenance | Render only after independent evidence; never infer trust from styling |
| Collectible / event | Optional participation and expressive rewards | Never fabricate scarcity, awards or user consent |

Prefer neutral, restrained badges. Status feedback should usually live near the content it qualifies, not repeat in every header and control. Reserve more prominent brand treatment for meaningful emphasis. A badge is not a general-purpose button, progress bar, security certification, or authorization decision.

## Web CSS patterns

Load `@goreecloud/ui/tokens.css` before `@goreecloud/ui/components.css`. Badge styles are **additive** and use existing semantic colors; the author must supply truthful text and accessible names. Classes:

- `gc-badge`: neutral passive label, wraps long text and RTL/localized content.
- `gc-badge--brand`: optional emphasis using the existing brand-container semantic roles.
- `gc-badge--positive`, `gc-badge--warning`, `gc-badge--negative`: semantic foreground variants; color is secondary to the words.
- `gc-badge--count`: tabular numerals for an explicitly labeled count.
- `gc-badge__indicator`: **decorative** status marker, always paired with visible wording.

```html
<span class="gc-badge gc-badge--positive">
  <span class="gc-badge__indicator" aria-hidden="true"></span>
  Available
</span>
<span class="gc-badge gc-badge--count">7 unread alerts</span>
```

For compressed counts, the owning app must supply an accessible equivalent such as `aria-label="120 unread notifications"` when displaying `99+`; use a native `<button>` or `<a>` with an accurate name if activation opens the inbox. Do **not** add `role="button"` or fake keyboard handling to a passive `<span>`. A removable chip uses a separately named removal button. Do not announce every static badge through `aria-live`; use an appropriate live region for meaningful changes.

## Acceptance and trust

Test narrow viewports, long translations, 200–400% text sizing, RTL, contrast, forced colors and reduced motion on actual target surfaces. Inspect the full screen for badge clutter and accidental high-priority emphasis. Status updates need an explicit stale/unavailable state when live data cannot be trusted; never fabricate a successful check or credential.

GC UI owns rendering and semantics. GoreeShield owns consent and visibility; GoreeCloud Identity owns account claims and access control; Wardveil owns cybersecurity assurance; GoreeCloud Mesh owns integration and provenance exchange. Issuance, signatures, persistence, revocation and privacy choices require separate product implementation and verified acceptance. The lab uses **illustrative local data** and cannot establish real awards, unread counts or operational health.
