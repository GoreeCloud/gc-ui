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
