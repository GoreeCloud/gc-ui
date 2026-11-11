# Planned action availability feedback (alpha)

This browser progressive-enhancement utility implements the founder's requirement that intended but not-yet-implemented controls remain visible and respond truthfully. It is **not** a replacement for application permissions, backend enforcement or a complete application inventory.

Import the GC UI stylesheet and controller:

~~~js
import { initAvailabilityFeedback } from '@goreecloud/ui';

const dispose = initAvailabilityFeedback(document, {
  region: document.querySelector('[data-gc-toasts]'),
});
// Call dispose() when the owning view unmounts.
~~~

Author a **native** keyboard-operable action and identify its state:

~~~html
<button type="button" class="gc-button"
  data-gc-availability="planned"
  data-gc-feature="Mesh integrations">
  Mesh integrations · Coming soon
</button>
<div class="gc-toast-region" data-gc-toasts aria-live="polite"></div>
~~~

The controller intercepts clicks on buttons, links and button-like input elements marked **planned** or **unavailable** during capture, prevents their default click/navigation behavior, and announces a concise informational toast with an accessible status role. Native button and link keyboard activation generates clicks automatically. Rapid identical announcements are coalesced for 1.2 seconds. Unmarked implemented actions are untouched. A host-specific native implementation can inject a trusted notifier through the optional notify callback.

For a **planned form**, mark the `<form data-gc-availability="planned" data-gc-feature="...">` itself. The controller also captures `submit` (including Enter and `requestSubmit()`), preventing accidental navigation and announcing availability. Individual planned submitters are intercepted even within an otherwise implemented form. Direct `form.submit()` does not dispatch a submit event and is not intercepted; do not leave real write handlers or unsafe form actions in planned UI.

**Safety and scope:** Do **not** attach side-effectful handlers, submit real forms, or attach sensitive destinations to planned actions. Capture interception is UX feedback, not a security boundary: earlier capture handlers, programmatic invocation, server endpoints and other event types still require independent protection. Prefer explicit backend authorization, fail-closed feature flags and removal of real writes before marking something planned. The feature name is passed to the shared toast as text, never HTML. This utility neither authenticates users nor stores/transmits data.

**Acceptance still pending:** human screen-reader and physical-device testing, full browser zoom and multitheme reviews, native OS adapters, and all consumer migrations. Node contract tests cover interception, safe input boundaries, notification coalescing, and teardown; Chromium lab coverage must be checked separately. Do not represent this alpha utility as Stable or universally adopted.
