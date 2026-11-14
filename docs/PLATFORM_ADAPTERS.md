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


## Native desktop consumer checkpoints — November 13, 2026

This is a **dated, scoped evidence register**, not certification of a native GoreeCloud UI SDK or all GoreeCloud desktop products. Source code, temporary-display tests, installed-user-device acceptance and release packaging are separate gates.

| Consumer | Verified source/CI | Verified native behavior | Still open |
| --- | --- | --- | --- |
| [GoreeCloud Browser](https://github.com/GoreeCloud/browser) (Qt/Linux development preview) | [Normal window and opt-in size memory](https://github.com/GoreeCloud/browser/pull/36), [full-screen transition regression](https://github.com/GoreeCloud/browser/pull/37), [F11 toggle](https://github.com/GoreeCloud/browser/pull/38), [multi-monitor work-area sizing](https://github.com/GoreeCloud/browser/pull/39) and [synthetic F11 Qt key dispatch](https://github.com/GoreeCloud/browser/pull/40) are merged. Relevant [Browser source CI](https://github.com/GoreeCloud/browser/actions/runs/43536768692) passed after an initial hosted-runner Ubuntu package-index failure and retry. | Normal startup; user-initiated maximize/restore/full-screen; F11 toggles back to previous normal/maximized state; opt-in normal dimensions remain local and clamp to usable dimensions across detected displays. Isolated laptop Qt/Xvfb and two-X-screen startup smoke passed; key delivery was a **synthetic Qt event**, not a physical keyboard. | Live GNOME/KDE input and window manager, hotplug/disconnect, HiDPI/multi-monitor user placement, accessibility, signed release; Windows/macOS not supported. |
| [GoreeCloud Index](https://github.com/GoreeCloud/index) (GTK4/libadwaita Linux development preview) | [Native state assertions](https://github.com/GoreeCloud/index/pull/40), [compact low-resolution sizing](https://github.com/GoreeCloud/index/pull/41), [all-monitor conservative sizing](https://github.com/GoreeCloud/index/pull/42) merged, with [six green Linux quality jobs](https://github.com/GoreeCloud/index/actions/runs/43536781577). | Undecorated, draggable and resizable normal search palette; 660×448 default on ordinary monitors, logical-geometry cap on small displays (390×300 floor). Existing private Xvfb GTK and hosted headless Weston tests passed, plus isolated laptop GTK smoke. | Real GNOME/KDE/Orca and portal acceptance, compositor placement and multi-monitor hotplug. GTK/Xvfb with two X screens exposed only **one** Gdk monitor in a local probe; pure unit tests cover mixed monitor enumeration, but this does **not** prove live multi-monitor GTK placement. |

**Evidence boundaries:** The authorized GNOME/Wayland laptop was used only for temporary checkouts, private HOME/XDG profiles, pure tests and isolated Xvfb native tests. The installed browser, personal browser profile and active desktop session were not changed. Native OS window placement, physical keyboard controls and monitor disconnect/reconnect are **not yet accepted**. The cross-platform native GC UI component SDK remains **not implemented**; these applications adopt the **behavior contract** independently. A planned [Browser two-X-screen CI gate](https://github.com/GoreeCloud/browser/pull/41) is additional regression coverage, not a completed merge until verified.

