# GoreeCloud UI — Rounded windows and floating bottom navigation

**Status:** Founder requirements mandatory. Web alpha primitives implemented incrementally; native adapters and consumer adoption remain unverified.

## Rounded windows: all application windows, all four corners

Every GoreeCloud application window, dialog, secondary surface, drawer and compact/maximized window should have rounded corners. The web gc-window shell uses canonical --gc-radius-xl (36px); gc-window--compact uses --gc-radius-lg (26px). gc-window--maximized retains rounded corners. Window titlebar, identity, controls, body and status bar use gc-window__titlebar, gc-window__identity, gc-window__controls, gc-window__body and gc-window__statusbar. Choose real buttons only for implemented actions; do not present fake close/minimize/resize controls.

The rule applies to the enclosing window frame, not to every table cell or grid line. Preserve readable opaque Cloud Surface, ergonomic focus, keyboard and RTL behavior. Drawers are inset so all four corners stay visible; forced-colors preserves a visible window edge.

### Native window-manager boundary

Web CSS cannot round system-managed window chrome, compositor title bars, resize handles, fullscreen OS controls or other applications. Native Android/Apple/Windows/Linux adapters must implement the requirement through supported platform APIs, with real OS builds and screenshot/assistive-tech verification. If the compositor forbids rounding outer fullscreen edges, implement a rounded in-app content frame and document the limitation rather than claiming OS enforcement. The web reference does not establish native SDK delivery.

## Floating bottom navigation: application destination pattern

Use a floating Cloud Lens capsule at the bottom of applications with multiple primary destinations. Reserve safe-area space above gesture/home bars, preserve content inset below the scrollable view, use visible text/icon labels and native links, and avoid duplicated competing docks. Keyboard, RTL, forced colors, reduced transparency, zoom and narrow responsive widths must be tested. A single-destination screen should not show inert fake tabs. Application navigation and route authorization remain consumer-owned, subject to GoreeCloud Identity, GoreeShield privacy, Wardveil security and GoreeCloud Mesh integration controls.

### Bottom navigation authorization boundary

The optional web `onNavigate` hook must make a synchronous route approval decision. Thrown errors, unexpected values and thenable/Promise results are treated as a denial of the native default link navigation, not implicit approval. Only `true` or no decision (`undefined`) permits navigation. Applications must still enforce route permissions server-side or in their authorized router and cannot use a visual dock as an Identity or Wardveil enforcement boundary.


## Window-owned Cloud Lens destination docks (web alpha)

A rounded web application with multiple panels uses a GC window in app-shell mode with a scrollable window body followed by a sibling bottom-nav in window mode. The window owns its floating pill: it stays centered above the window bottom while its content scrolls separately. Unlike the viewport bar, window mode never uses a device gesture safe-area inset inside another app window. Real app consumers choose either the viewport dock or the window-owned dock; the design lab displays both as **separate demonstrations**, not a mandate to duplicate navigation. The same initBottomNavigation controller handles keyboard semantics, disabled routes and consumer-owned authorization. The window has all four rounded corners; no native OS-managed chrome has been implemented.

App-shell layout intentionally does not prescribe window width or height: a consuming app or OS shell owns its window dimensions. Set an explicit block size on the containing window when its body must scroll; the design lab uses only a smaller 560px/500px preview window to demonstrate visual separation from the independent page-level dock. Real consumers should select one context, not stack both docks.


## Adaptive collapsible tablet, desktop and web app navigation rail

**Founder requirement (November 11, 2026):** A sidebar/navigation rail is mandatory in tablet, desktop and browser-based applications when they have primary destinations; the user must be able to collapse the full labeled sidebar to icon-only destinations. The web alpha implementation uses `gc-navigation-shell`, `gc-navigation-rail` and the `initNavigationRail()` controller. Tablet initializes icon-only; desktop initializes labeled; the user can override either. Phone hides the rail in favor of the existing bottom dock where appropriate. Never show two competing primary navs. Use native links, accessible icon labels, a named expand/collapse button with `aria-expanded`, responsive layout space, reduced-motion and forced-colors fallbacks. Server/router authorization remains independent. See [NAVIGATION_RAIL.md](NAVIGATION_RAIL.md) for markup, responsive defaults, tests and outstanding native/manual acceptance.
