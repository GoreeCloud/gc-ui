# GoreeCloud UI — Adaptive collapsible navigation rail

**Founder requirement (November 11, 2026):** GoreeCloud tablet, desktop and browser-based application layouts must provide a **collapsible sidebar/navigation rail** that shrinks to **icons**. This is a mandatory design pattern; its implementation remains a web alpha component until per-consumer acceptance.

## Responsive contract

- **Desktop/web wide, 1024 CSS px and above:** full **248px** labeled sidebar by default; the user can collapse it to a **76px icon rail**.
- **Tablet/intermediate, 601–1023 CSS px:** compact **76px icon rail** by default; the user can expand it to full labeled sidebar.
- **Phones, 600 CSS px and below:** the rail is hidden. Use the existing floating bottom-nav pattern only when the consumer actually has multiple primary destinations. Do **not** show the rail and bottom dock as two competing sets of primary navigation.
- Defaults react to breakpoint changes until the user deliberately toggles in the current controller lifetime. User preference takes priority afterward. No persistence or tracking is performed by the shared component; consumers wishing to remember the choice require a separately reviewed privacy and storage policy.

Widths are component-local layout defaults, **not new canonical tokens**. Consumers can override `--gc-navigation-rail-expanded` and `--gc-navigation-rail-compact` where justified by tested content. Icons retain the canonical 24px visual style; links and toggle keep a minimum 44px interaction height, visible focus, color-independent selected state and sensible RTL layout through logical CSS properties.

## Markup and controller

Load `src/tokens.css`, then `src/components.css`. Use native `aside`, `nav`, `a` and `button` elements:

```html
<div class="gc-navigation-shell">
  <aside class="gc-navigation-rail" aria-label="Workspace navigation">
    <button type="button" class="gc-navigation-rail__toggle"
            data-gc-rail-toggle aria-controls="workspace-nav"
            aria-label="Collapse navigation" aria-expanded="true">
      <gc-icon name="menu"></gc-icon>
      <span class="gc-navigation-rail__toggle-label">Navigation</span>
    </button>
    <nav id="workspace-nav" class="gc-nav gc-navigation-rail__links" aria-label="Destinations">
      <a href="#home" aria-current="page">
        <gc-icon name="home"></gc-icon><span class="gc-navigation-rail__label">Home</span>
      </a>
      <a href="#settings">
        <gc-icon name="settings"></gc-icon><span class="gc-navigation-rail__label">Settings</span>
      </a>
    </nav>
  </aside>
  <main id="main">Application content</main>
</div>
```

```js
import { defineCustomElements, initNavigationRail } from "@goreecloud/ui";
defineCustomElements();
const rail = initNavigationRail(document.querySelector(".gc-navigation-rail"));
// rail.collapsed, rail.setCollapsed(boolean), rail.toggle(), rail.sync(), rail.dispose()
```

The icon-only presentation visually clips label text without removing it from the accessible tree. Where links have no custom `title`, the controller supplies a hover tooltip from their readable label while collapsed and restores previous titles when expanded or disposed. The toggle has descriptive `aria-expanded` and `aria-controls` relationships. Native links remain navigation; hash and history changes synchronize `aria-current="page"`, while disabled links cannot be activated through the rail. The default `unknownRoute: "preserve"` retains existing consumer-owned markup for unrecognized URLs. Consumers whose router uses an exact known-destination list can opt in to `initNavigationRail(rail, { unknownRoute: "clear" })`; then cold unknown URLs, disabled routes and later unmatched history states clear stale `aria-current` from every rail link, while returning to an enabled known route restores a single current destination. This is presentation-only URL truthfulness, not a navigation authorization mechanism. Do **not** use link visibility or the rail to enforce authentication, permissions or security: those belong to GoreeCloud Identity and Wardveil, under GoreeShield consent and Mesh integration boundaries.

## Verification and acceptance

`tests/navigation-rail.test.js` checks responsive defaults, explicit user override, accessible labels, route synchronization, disabled links, controller disposal and restoration. `tests/browser-smoke.mjs` renders real Chromium desktop (1440×900), tablet (820×900) and phone (390×844) states, checks expansion width, tooltip/readable label, focus, current destination, horizontal overflow and navigation presentation, and saves before/after screenshots.

Manual screen-reader operation (Orca, NVDA, VoiceOver, TalkBack), physical tablet/desktop visual approval, OS text enlargement, RTL and multi-consumer acceptance are separate open gates; a CI pass does not certify them. Native desktop/Android/iOS adapters must separately implement the analogous platform behavior in native UI rather than claiming this web controller is a native SDK. The lab is a development reference and does not make every GoreeCloud consumer automatically compliant.
