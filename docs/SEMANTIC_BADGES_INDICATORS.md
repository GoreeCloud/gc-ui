# GoreeCloud UI — Semantic Badges, Indicators, and Asynchronous Feedback

**Status:** Implemented as an **alpha web source API** in `src/feedback.js`, `src/feedback.d.ts`, and `src/components.css`. This is not a Stable release, native SDK, award server, authorization system, deployed service, or evidence that any particular consumer has adopted the API.

**Authority:** `GoreeCloud/Standards/GoreeCloud-Badge-System.md`, `GoreeCloud/Requirements/Requirement - GoreeCloud UI Semantic Indicators Badges Color-Coding and Loading Feedback.md`, and the existing GC UI design-language contracts. GoreeCloud UI is the only visual-design authority. The owning product and trusted backend own the truth of each displayed claim.

## Purpose and family vocabulary

**Badges describe information, indicators describe live or recorded state, and alerts communicate matters needing attention.** Every badge must earn its space in the interface. Context-specific product presentation may vary, but meaning must not.

| Family | Allowed interpretation | Who owns the fact |
| --- | --- | --- |
| `icon` | Compact description or identifier | Product |
| `achievement` | Earned milestone/award | Trusted achievement issuer; entitlement must be validated outside UI |
| `profile` | Opt-in user-selected or earned distinction | Profile owner and visibility policy |
| `status` | Named operational/workflow state | Monitored service or authoritative task state |
| `role` | Membership or descriptive role, **not permissions** | Identity/role provider |
| `verification` | Validated claim with issuer, evidence reference and timestamp | Verification authority, independently validated by the consuming product |
| `notification` | Scoped update or unread count | Application notification state and privacy policy |
| `recognition` | Optional community/event recognition | Authorized issuer and user visibility settings |

Color tones: `neutral`, `info`, `positive`, `warning`, `negative`. **Info deliberately uses existing neutral semantic tokens rather than an accent that changes meaning with user theme.** Missing, stale or unknown data must not be inferred as positive. `offline` is neutral unless independent evidence establishes failure; `degraded` is warning; `failed` is negative; `synced` is positive only when known. Never use successful completion for queued, in-flight or unconfirmed operations.

The CSS family selectors differentiate badges with shape, border style and optional first-party icons. The eight badge types are distinct visual concepts, not eight new services. Current alpha `gc-badge`, `gc-chip`, `gc-alert`, `gc-progress`, `gc-skeleton`, theme tokens and native HTML semantics remain the foundations. Do not create separate product badge frameworks.

## Web API (alpha)

Import `@goreecloud/ui/feedback`, or import these functions from `@goreecloud/ui`. Consumers must import `@goreecloud/ui/tokens.css` before `@goreecloud/ui/components.css`, apply the `gc-app` root class, and register optional first-party icons via `defineCustomElements()`.

```js
import {
  createBadge, createStatusIndicator, createCountBadge,
  createTaskProgress, createAsyncFeedback
} from '@goreecloud/ui/feedback';

const doc = document;
const ready = createStatusIndicator({ state: 'online', label: 'Online' }, doc);
const unread = createCountBadge({ count: 105, scope: 'unread mentions' }, doc); // 99+
const privateCount = createCountBadge({ count: 4, sensitive: true }, doc); // dot, no exact count in DOM
const loading = createAsyncFeedback({ state: 'loading', label: 'Loading photos', rows: 3 }, doc);
const upload = createTaskProgress({ label: 'Uploading', done: 3, total: 10 }, doc);
const award = createBadge({ family: 'achievement', label: 'First contribution' }, doc);

// ONLY after the consumer has independently validated the proof using its issuer:
const verified = createBadge({
  family: 'verification', label: 'Verified', tone: 'positive',
  issuer: 'GoreeCloud Identity', evidenceRef: 'example-claim-ref',
  verifiedAt: '2026-11-19T00:00:00Z'
}, doc);
```

These functions create **passive DOM nodes** using `textContent` and validated built-in icon names; they do not use `innerHTML`, request network access, persist data, open URLs, issue badges, or grant privileges. A verification badge checks that provenance metadata is present, **not whether it is authentic**; the consuming product must validate issuer, signature/evidence, expiry/revocation and current scope on its authoritative backend before passing a verified claim. Do not display proof identifiers as sensitive HTML metadata.

`createBadge()` returns `null` for `visibility:'hidden'`. `createCountBadge()` returns `null` for zero or hidden counts; its optional `max` caps visual display at e.g. `99+` while an accessible label can expose the exact count for nonsensitive content. For `sensitive:true`, the default is an unlabeled visual dot with the generic accessible name `New activity`, and attempts to use the numeric mode throw. **This is a defense-in-depth presentation rule, not GoreeShield authorization**. The consumer still decides whether *any* activity marker is permitted to appear, including on lock screens and shared surfaces.

`createTaskProgress()` creates a native `<progress>` element: omit `done` and `total` when percent is unknown, and only specify phase `complete` with `confirmed:true` from the owning operation. `createAsyncFeedback()` creates a skeleton for predictable `loading` regions and a readable message for `ready`, `empty`, `offline`, `stale`, `error`, `permission-denied`, `timed-out`, `cancelled`, or `unknown` states. Replace the skeleton with **real content** or the appropriate terminal/recovery UI when the operation resolves; a skeleton must never remain indefinitely after failure. Retry, cancel, or resume controls must be real consumer actions, not fake design-system buttons.

## Accessibility, semantics and interaction

- **Passive by default:** no click handlers or role-button semantics on a status badge. Real actions belong in native buttons or links with focus handling and discernible names. Removable chips use existing independent close controls.
- **Color independent:** retain textual state labels, distinct mark shapes, or known icon names; never require color perception for a high-priority message. Do not use ungrounded trust icons.
- **Announce judiciously:** do not pollute screen-reader live regions with every background status change. Skeleton shapes are hidden from assistive technology; their parent has the loading name. Use `role=alert` in the consumer only for genuinely urgent updates, and associate form feedback with inputs.
- **Appearance:** the extension uses current `--gc-*` tokens across Iris/Lagoon/Ember/Moss, light and dark modes, solid and Cloud Lens surfaces, and CSS forced-colors fallback. Reduced-motion rules already apply to skeleton shimmer. Consumer-level contrast, high zoom, RTL, reduced-transparency and device checks remain required.
- **Counts and labels:** localize and pluralize scope in the consumer; prevent unread count leakage when a view is public, untrusted or captured. Use screen-space limits/priority filtering to avoid flooding navigation with badges.

## Ecosystem integration map (suggested adapters, not completed)

| Consumer | Relevant semantics | Owning evidence |
| --- | --- | --- |
| Photos / Backup | favorite, shared, queued, backing up, synced, conflict | Media/backup job state |
| Teams / Messenger / Notify | mention count, presence, role, sending, delivered, read | Authorized conversation/message state |
| Vault / Identity | passkeys, verification, credential-expired and security warnings | Identity/Vault and server-side proof, never CSS |
| Monitor / Wardveil | healthy, degraded, incident, scan progress, stale signal | Monitor / security source and timestamp |
| GoreeShield | private/shared, consent/retention notices | Privacy policy engine and user choices |
| GoreeCloud Mesh | local, remote, pending sync, conflict, recovery | Explicit service-local and remote synchronization state |
| Calendar / Tasks / AI | reminders, due, active model, streaming, failures | Owner application events and completion outcomes |

**Contract for consumers:** document family, source/issuer, freshness/time, visibility, classification, actual interactions, accessible label, lifecycle, and precise assertion. Only render states that are verified in the product context. In-progress or roadmap-only features should display honest availability feedback, not success badges.

## Implementation and validation record

**Implemented web source:** semantic family/tone/state vocabulary; passive badge and status nodes; privacy-aware count badge with overflow; native determinate/indeterminate task progress; predictable skeleton and terminal-state feedback; theme-aware CSS and forced-colors extension; typed entrypoint; isolated unit/contract tests; static lab example.

**Not implemented by this change:** trusted issuer or achievement database; universal achievements/profile badge registry; real-time presence or monitoring; cross-product event subscriptions; GoreeShield enforcement; server-side role authorization; native Linux/Android/TV adapters; automatic locale pluralization; consumer migrations, releases or deployment. These belong to their owning systems and require separate acceptance.

**Acceptance checks:** `node --test tests/feedback.test.js`, `npm run check`, package export verification, and an actual rendered reference-page visual audit across representative themes and viewports. Passing unit tests alone is not evidence of browser/device accessibility or ecosystem-wide adoption.
