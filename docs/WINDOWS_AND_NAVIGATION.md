# GoreeCloud UI — Rounded windows and floating bottom navigation

**Status:** Founder requirements mandatory. Web alpha primitives implemented incrementally; native adapters and consumer adoption remain unverified.

## Window Command Nodes (WCN) — official GoreeCloud UI window controls

**Founder design directive — November 14, 2026.** **Design status:** circular, flat, glyph-free, right-aligned controls are founder-approved. A browser/web-alpha host-callback controller and CSS are implemented for preview/consumers; native window-manager adapters and consumer adoption are **not** verified. **Official name:** *GoreeCloud UI Window Command Nodes (WCN)*. **Short name:** *Command Nodes*. **GoreeCloud motto:** *Your workspace, your way.*

I created Window Command Nodes as GoreeCloud's distinctive window-management language: flat, glyph-free, right-aligned window controls with their own color identity. Their purpose is precise, seamless window interaction that feels consistent and unmistakably GoreeCloud.

| Official node | Action | Required semantics |
| --- | --- | --- |
| **Crimson Node — Dismiss** | Close the active window | Invoke the supported native window-close action; do not equate this with deleting user data, force-quitting the application, or bypassing unsaved-work safeguards. |
| **Amber Node — Dock** | Minimize the active window into the workspace dock | Invoke the supported native minimize action; this means the desktop window/dock mechanism, **not** GoreeCloud UI's in-app floating destination navigation. |
| **Teal Node — Expand** | Maximize the active window, or restore it when already maximized | Reflect the current maximized/restored state in the accessible name and the action. |

### Visual and placement contract

- The three distinct nodes appear together as a consistent **right-aligned** group in the window titlebar. Preserve physical right-edge placement, including for RTL layouts, while maintaining accessible keyboard navigation.
- The node faces are **flat and contain no glyphs, letters, punctuation, icons, or other visible action symbols**. This explicit founder direction resolves the conflict with the earlier prose mention of an “action symbol.” Do not add an X, minus, square, chevron, or hover-only pictogram.
- Use the **Crimson, Amber, and Teal** WCN palette, independent of each application's accent. The shared source is `tokens/gc.tokens.json#windowCommandNodes.colors`; the **light/dark numeric colors are implementation candidates, not an independently founder-approved final color swatch**. Keep contrast and forced-colors access.
- **Founder shape clarification (November 14, 2026): all three node faces are circles, visually similar in basic geometry to macOS window dots but original in color, right placement and glyph-free treatment.** The shared web-alpha specification uses **18px circular faces inside 44px circular interaction targets**, with zero additional gap; the face sizing/spacing remain tunable design implementation choices pending full visual acceptance.
- Window frames retain the GoreeCloud rounded-corner requirement; the circular nodes themselves remain visually flat. Cloud Lens frosted material on an appropriate surrounding titlebar is a separate decision, not a node-face requirement.

### Web-alpha component and native action boundary

Use three **empty** real buttons as direct children of a physically right-aligned `gc-window__command-nodes` group, in Dismiss/Dock/Expand order; never place an icon or glyph inside a face. Import `initWindowCommandNodes` from `@goreecloud/ui` or `@goreecloud/ui/window-command-nodes`. Supply all three native host callbacks: `onDismiss`, `onDock`, and `onExpand`. Omission **throws** instead of creating inert fake OS controls. Each callback receives `{ action, maximized, signal }`; `onExpand` may return a **confirmed boolean** window state, or the host may call `setMaximized(boolean)` after its own window-state event. The controller never calls `window.close()`, guesses permission, or automatically toggles an unconfirmed state. `dispose()` aborts pending operations and detaches handlers. Applications retain unsaved-work checks, authorization, error feedback, and native lifecycle behavior. See [component usage](COMPONENTS.md#window-command-nodes-wcn--web-alpha).

A browser design-lab demo may operate only its **local simulated window element** and must say so visibly. Desktop OS close/minimize/maximize behavior requires independently built and verified host adapters. High-contrast mode replaces the color signal with forced-colors-compatible controls and accessible text labels; no node-face glyphs appear in either mode.

### Interaction, accessibility, and platform requirements

- Use real focusable, keyboard-operable controls wired to genuine supported window actions. Accessible names must describe “Close window,” “Minimize window,” and context-dependent “Maximize window” / “Restore window.” Optional text tooltips can clarify actions **outside** the glyph-free faces.
- Provide visible focus states, adequate hit areas, state feedback, contrast, disabled behavior, screen-reader support, high-contrast/forced-colors alternatives and reduced-motion accommodations. Colors alone are not sufficient identification: combine accessible names with discoverable tooltips or other non-face guidance.
- Preserve unsaved-work protection, OS window-manager permissions and native lifecycle behavior. Never show a seemingly functional node whose action cannot be executed. Report unimplemented and unsupported cases accurately.
- Native decorations and minimize-to-dock mechanics are platform-dependent. A browser-rendered GC window is a visual demonstration, **not** proof of desktop OS window management. Comply with supported APIs instead of forcing fake native controls.
- Verify normal and maximized states, keyboard navigation, screen readers, zoom, right alignment in RTL, light/dark themes, forced colors, reduced motion, and each supported desktop adapter before claiming implementation compliance.

### Official description and terminology

**GoreeCloud UI Window Command Nodes:** I developed Window Command Nodes as GoreeCloud's signature window-management controls to provide a modern, intuitive, recognizable desktop experience. Each node is differentiated by its named color, intended geometry and window action, **without any glyph or action symbol on the node face**. My goal is to make window management feel seamless, visually consistent and distinctly GoreeCloud.

Use **Window Command Nodes (WCN)** on first reference, then **Command Nodes** where brevity helps. **Dismiss**, **Dock**, and **Expand** identify their actions; these names do not change OS-level semantics. The signature **browser-reference CSS and callback controller are implemented in web alpha**, but this is not evidence of native platform integration, founder-accepted visual polish, or any consumer deployment.

## Desktop startup state: normal window by default

**Founder directive (November 13, 2026):** Native Linux, Windows and macOS
GoreeCloud desktop applications open in a **normal, resizable, non-maximized,
non-full-screen window by default**. The operating system retains control over
window placement, native title bars and focus. Users can deliberately maximize,
restore or enter full-screen; a supported saved state should only override the
first-run normal default when the user explicitly chose it.

Apps must keep normal-window bounds usable as monitor layouts, scale factors
and panel/work-area dimensions change. Secondary dialogs should follow native
transient-window conventions, not automatically become immersive. A deliberately
user-invoked presentation/kiosk mode is a documented exception.

This behavior is independent of the rounded-frame requirement below: it does
not authorize replacing OS-managed windows with full-screen CSS mockups. The
machine-readable [design authority](../registry/design-authority.v1.json)
records this desktop policy, and the [native adapter contract](PLATFORM_ADAPTERS.md)
defines per-platform acceptance. GoreeCloud UI's web-first Stable 1.0 candidate
still does **not** certify native desktop SDKs, complete consumer adoption,
actual window-manager acceptance or new OS support.

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
