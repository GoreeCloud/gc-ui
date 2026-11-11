# GoreeCloud UI — Rounded windows and floating bottom navigation

**Status:** Founder requirements mandatory. Web alpha primitives implemented incrementally; native adapters and consumer adoption remain unverified.

## Rounded windows: all application windows, all four corners

Every GoreeCloud application window, dialog, secondary surface, drawer and compact/maximized window should have rounded corners. The web gc-window shell uses canonical --gc-radius-xl (36px); gc-window--compact uses --gc-radius-lg (26px). gc-window--maximized retains rounded corners. Window titlebar, identity, controls, body and status bar use gc-window__titlebar, gc-window__identity, gc-window__controls, gc-window__body and gc-window__statusbar. Choose real buttons only for implemented actions; do not present fake close/minimize/resize controls.

The rule applies to the enclosing window frame, not to every table cell or grid line. Preserve readable opaque Cloud Surface, ergonomic focus, keyboard and RTL behavior. Drawers are inset so all four corners stay visible; forced-colors preserves a visible window edge.

### Native window-manager boundary

Web CSS cannot round system-managed window chrome, compositor title bars, resize handles, fullscreen OS controls or other applications. Native Android/Apple/Windows/Linux adapters must implement the requirement through supported platform APIs, with real OS builds and screenshot/assistive-tech verification. If the compositor forbids rounding outer fullscreen edges, implement a rounded in-app content frame and document the limitation rather than claiming OS enforcement. The web reference does not establish native SDK delivery.

## Floating bottom navigation: application destination pattern

Use a floating Cloud Lens capsule at the bottom of applications with multiple primary destinations. Reserve safe-area space above gesture/home bars, preserve content inset below the scrollable view, use visible text/icon labels and native links, and avoid duplicated competing docks. Keyboard, RTL, forced colors, reduced transparency, zoom and narrow responsive widths must be tested. A single-destination screen should not show inert fake tabs. Application navigation and route authorization remain consumer-owned, subject to GoreeCloud Identity, GoreeShield privacy, Wardveil security and GoreeCloud Mesh integration controls.
