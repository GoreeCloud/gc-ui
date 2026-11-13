# GoreeCloud UI — Native and operating-system porting contract

**Implemented:** a web reference foundation and deterministic Android XML, SwiftUI, XAML, GTK, and JSON color-resource export generator. **Not implemented:** production Android/iOS/Linux/Windows/macOS native component SDKs, OS shell themes, validated installer packages, wallpaper extraction or cross-device acceptance.

A native port can generate resources with npm run export:platform (see PLATFORM_BRIDGE.md) and should ingest the versioned tokens/gc.tokens.json manifest at build time and map semantic roles to platform appearance primitives. Maintain shape, typographic hierarchy, safe-area behavior and material decisions while using the platform's native interaction and assistive interfaces.

| Platform | Suggested native adapter | Required evidence before calling it supported |
| --- | --- | --- |
| Android | Jetpack Compose / Views | Real builds, semantics, gesture areas, accessibility services, lifecycle and theme |
| iOS/iPadOS | SwiftUI / UIKit | VoiceOver, Dynamic Type, safe areas, blur energy impact, signing and device |
| Windows | WinUI / Windows App SDK | keyboard, contrast mode, scaling, window chrome, packaged build |
| Linux | GTK4 / Qt | GNOME/KDE theme conventions, assistive APIs, packaging and runtime |
| macOS | SwiftUI / AppKit | window/toolbar conventions, VoiceOver, scaling and signed application |
| TV / wearables | OS-specific native kits | remote focus, distance, device affordances and performance |

Delivery sequence: (1) review/freeze token schema; (2) generate native assets from reviewed semantic roles; (3) implement native controls; (4) run visual, accessibility, behavior and battery/performance matrices; (5) integrate into real apps; (6) independently validate release artifacts.

GC UI is presentation only. GoreeCloud Identity owns authorization, GoreeShield owns **privacy**, Wardveil owns **cybersecurity**, GoreeCloud Mesh owns interoperability. Do not silently read credentials, perform telemetry or assume those systems are implemented by a UI component. No independent native SDK claims should appear until real code/tests exist.

## Mandatory rounded windows and bottom navigation

Every native GoreeCloud window must have rounded corners, including maximized frames and secondary dialogs; integrate canonical XL/LG shape roles with documented OS APIs. If the compositor forbids outer corner changes, retain an in-app rounded frame and document the exception. A native floating bottom navigation bar must respect system gestures, insets, keyboard and accessibility semantics. No native adapter for these requirements is implemented or certified here.

## Founder floating-navigation direction

GoreeCloud apps with multiple primary destinations require a rounded floating bottom navigation capsule. Native adapters must respect system gesture insets, screen-reader semantics and keyboard/remote focus. The web alpha implementation is not a native SDK; builds and real device testing remain open.

## Distinguish viewport navigation from individual-window navigation

The alpha web reference has two alternatives: a viewport bar for a full-screen application and a separate bar owned by a rounded app window with independent scrolling. Native adapters must preserve the same visual hierarchy while using native platform navigation, gesture safe areas, focus, window lifecycle and accessibility semantics. Do not duplicate the two bars within one consuming app. The machine-readable authority records both contexts but still declares native SDKs unimplemented and OS/device acceptance unverified.

## Desktop startup window state — founder directive (November 13, 2026)

**Default:** GoreeCloud desktop application windows on Windows, Linux and macOS must initially open in a **normal, windowed (neither maximized nor full-screen)** OS-managed state. Choose a usable, responsive starting size rather than filling the display; keep the application, surrounding desktop and other windows available. This is a **behavior contract** for future native implementations, not evidence that those implementations currently exist.

- Provide native window controls for resizing, minimizing, maximizing, restoring and full-screen where the operating system supports them. Do not disable or disguise native window-management affordances solely to enforce GC UI styling.
- The *default* applies on first run, when no valid user preference exists, or after resetting window preferences. Honor a user's **explicitly chosen** maximized or full-screen state when reopening if the app supports and documents local window-state restoration; do not continually force normal mode against the user's choice.
- Keep normal window geometry on-screen and usable after resolution, display, scale or multi-monitor changes. Clamp saved bounds to the currently available work area, maintain reasonable minimum sizes, and never restore a window entirely off-screen.
- Open secondary dialogs and tool windows according to native transient-window conventions. Do not unexpectedly maximize them or force an immersive experience.
- An intentionally immersive mode (such as a user-invoked presentation, video or kiosk session) is an **explicit exception**, not the generic startup default. Product-specific exceptions must be documented, justified and user-controllable when feasible.
- Respect native desktop focus, accessibility and keyboard conventions. A visual web mockup or CSS-framed app window is not proof of operating-system window behavior.

**Native acceptance:** For each supported desktop platform, verify clean-profile launch is normal-windowed; explicit maximize/full-screen and restore transitions work; intentional saved states are honored without overriding the default; disconnected-monitor or DPI changes cannot leave the app inaccessible; and dialogs behave correctly. Record actual native build/runtime evidence separately from web examples and token exports.

This policy does **not** expand the narrowly scoped web Stable 1.0.0 foundation. Desktop adapters remain candidates for independently qualified 1.1+ releases, subject to the current release roadmap.
